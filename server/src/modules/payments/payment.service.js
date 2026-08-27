const crypto = require('crypto');
const Order = require('../orders/order.model');
const Payment = require('./payment.model');
const PaymentEvent = require('../payment-events/paymentEvent.model');
const Pharmacy = require('../pharmacies/pharmacy.model');
const stripeSandboxAdapter = require('../payment-gateways/stripeSandbox.adapter');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../orders/order.constants');
const { PAYMENT_PROVIDER, GATEWAY_EVENT } = require('./payment.constants');

/**
 * Generate a unique payment number (e.g., PAY-20260802-B71C4E)
 */
const generatePaymentNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PAY-${dateStr}-${randomStr}`;
};

/**
 * Create a new card checkout session.
 */
exports.createCardCheckoutSession = async (orderId, customerId) => {
  // 1. Fetch the order
  const order = await Order.findOne({ _id: orderId, customerId });
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  // 2. Validate Order State
  if (order.orderStatus !== ORDER_STATUS.PENDING_PAYMENT) {
    throw new ApiError('Order is not in a state that accepts payment', 400);
  }

  if (order.paymentStatus === PAYMENT_STATUS.PAID || order.paymentStatus === PAYMENT_STATUS.COD_PENDING) {
    throw new ApiError('An active or successful payment already exists for this order', 400);
  }

  // 3. Count past payment attempts to implement retry logic
  const pastAttemptsCount = await Payment.countDocuments({ orderId: order._id });
  
  if (pastAttemptsCount >= env.PAYMENT_MAX_ATTEMPTS_PER_ORDER) {
    throw new ApiError(`Maximum payment attempts (${env.PAYMENT_MAX_ATTEMPTS_PER_ORDER}) exceeded for this order`, 429);
  }

  // 4. Check cooldown for recent attempts
  const latestPayment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
  if (latestPayment) {
    const timeSinceLastAttempt = (Date.now() - new Date(latestPayment.createdAt).getTime()) / 1000;
    if (timeSinceLastAttempt < env.PAYMENT_RETRY_COOLDOWN_SECONDS) {
      throw new ApiError(`Please wait ${env.PAYMENT_RETRY_COOLDOWN_SECONDS} seconds before retrying`, 429);
    }
  }

  const currentAttempt = pastAttemptsCount + 1;
  const idempotencyKey = `session:ord_${order._id}:cust_${customerId}:attempt_${currentAttempt}`;

  // 5. Create Payment record in PROCESSING state
  const payment = new Payment({
    paymentNumber: generatePaymentNumber(),
    orderId: order._id,
    customerId: customerId,
    pharmacyId: order.pharmacyId,
    method: PAYMENT_METHOD.CARD,
    provider: PAYMENT_PROVIDER.STRIPE_SANDBOX,
    currency: order.currency || env.DEFAULT_CURRENCY,
    amount: order.total,
    status: PAYMENT_STATUS.PROCESSING,
    attemptNumber: currentAttempt,
    idempotencyKey
  });

  await payment.save();

  // 6. Create Sandbox Gateway Checkout Session
  try {
    const sessionResult = await stripeSandboxAdapter.createCheckoutSession({
      orderId: order._id.toString(),
      amount: order.total,
      currency: order.currency || env.DEFAULT_CURRENCY,
      successUrl: `${env.CLIENT_URL}/customer/orders/${order._id}/payment/success`,
      cancelUrl: `${env.CLIENT_URL}/customer/orders/${order._id}/payment/cancel`,
      idempotencyKey,
      metadata: {
        paymentId: payment._id.toString(),
        orderNumber: order.orderNumber,
        customerId: customerId.toString(),
        attemptNumber: currentAttempt.toString()
      }
    });

    // 7. Update payment record with gateway session ID
    payment.gatewaySessionId = sessionResult.sessionId;
    await payment.save();

    return {
      paymentId: payment._id,
      paymentNumber: payment.paymentNumber,
      checkoutUrl: sessionResult.url,
      status: payment.status
    };
  } catch (error) {
    // If gateway fails immediately (e.g. network issue), mark attempt as FAILED safely
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureCode = 'GATEWAY_ERROR';
    payment.failureMessage = error.message;
    await payment.save();
    
    throw new ApiError('Failed to initialize secure checkout with the payment gateway', 502);
  }
};

/**
 * Manually verify a checkout session, used as a fallback if webhooks fail or are not configured locally.
 */
exports.verifyCheckoutSession = async (orderId, customerId) => {
  const session = await Order.startSession();
  try {
    session.startTransaction();

    const order = await Order.findOne({ _id: orderId, customerId }).session(session);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      await session.abortTransaction();
      session.endSession();
      return { status: 'PAID' }; // Already processed by webhook
    }

    const payment = await Payment.findOne({ 
      orderId, 
      status: PAYMENT_STATUS.PROCESSING,
      provider: PAYMENT_PROVIDER.STRIPE_SANDBOX 
    }).sort({ createdAt: -1 }).session(session);

    if (!payment || !payment.gatewaySessionId) {
      await session.abortTransaction();
      session.endSession();
      return { status: 'PENDING' };
    }

    const stripeSandboxAdapter = require('../payment-gateways/stripeSandbox.adapter');
    const stripe = stripeSandboxAdapter.stripe;
    if (!stripe) {
      await session.abortTransaction();
      session.endSession();
      return { status: 'PENDING' };
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(payment.gatewaySessionId);
    
    if (checkoutSession.payment_status === 'paid') {
      // Simulate webhook processing
      const parsedEvent = {
        eventId: `manual_verify_${checkoutSession.id}`,
        eventType: GATEWAY_EVENT.PAYMENT_SUCCEEDED,
        status: 'succeeded',
        amountPaid: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        metadata: {
          paymentId: payment._id.toString(),
          orderNumber: order.orderNumber,
          customerId: customerId.toString(),
          attemptNumber: payment.attemptNumber.toString()
        },
        rawSession: checkoutSession
      };

      await session.commitTransaction();
      session.endSession();

      // Call processPaymentEvent outside of transaction
      await exports.processPaymentEvent(parsedEvent, PAYMENT_PROVIDER.STRIPE_SANDBOX);
      return { status: 'PAID' };
    }

    await session.commitTransaction();
    session.endSession();
    return { status: 'PENDING' };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Manual verification failed:', error);
    return { status: 'PENDING' };
  }
};

/**
 * Handle incoming webhook events from the payment gateway.
 * Verifies the signature, deduplicates the event, and delegates processing.
 */
exports.handleWebhookEvent = async (rawBody, signature, provider = PAYMENT_PROVIDER.STRIPE_SANDBOX) => {
  let rawEvent;
  
  // 1. Verify Signature
  if (provider === PAYMENT_PROVIDER.STRIPE_SANDBOX) {
    try {
      rawEvent = await stripeSandboxAdapter.verifyWebhookSignature(rawBody, signature);
    } catch (err) {
      throw new ApiError(err.message, 400);
    }
  } else {
    throw new ApiError(`Unsupported webhook provider: ${provider}`, 400);
  }

  // 2. Parse Event
  let parsedEvent;
  if (provider === PAYMENT_PROVIDER.STRIPE_SANDBOX) {
    parsedEvent = await stripeSandboxAdapter.parseWebhookEvent(rawEvent);
  }

  return await exports.processPaymentEvent(parsedEvent, provider);
};

exports.processPaymentEvent = async (parsedEvent, provider) => {
  let paymentEvent;
  try {
    paymentEvent = await PaymentEvent.create({
      provider,
      eventId: parsedEvent.eventId,
      eventType: parsedEvent.eventType,
      signatureVerified: true,
      processed: false
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - event already received
      paymentEvent = await PaymentEvent.findOne({ provider, eventId: parsedEvent.eventId });
      if (paymentEvent && paymentEvent.processed) {
        // Already successfully processed, just acknowledge
        return { acknowledged: true, alreadyProcessed: true };
      }
    } else {
      throw error;
    }
  }

  // 4. Process the business logic within a transaction
  const session = await Order.startSession();
  const notificationsToEmit = [];
  try {
    session.startTransaction();

    let payment;
    if (parsedEvent.metadata && parsedEvent.metadata.paymentId) {
      payment = await Payment.findById(parsedEvent.metadata.paymentId).session(session);
    } else if (parsedEvent.gatewaySessionId) {
      payment = await Payment.findOne({ gatewaySessionId: parsedEvent.gatewaySessionId }).session(session);
    }

    if (payment) {
      const order = await Order.findById(payment.orderId).session(session);

      switch (parsedEvent.eventType) {
        case GATEWAY_EVENT.PAYMENT_SUCCEEDED:
          if (payment.status !== PAYMENT_STATUS.PAID) {
            payment.status = PAYMENT_STATUS.PAID;
            payment.paidAt = new Date();
            if (parsedEvent.gatewayPaymentReference) {
              payment.gatewayPaymentReference = parsedEvent.gatewayPaymentReference;
            }
            await payment.save({ session });

            // Queue notifications
            const { NOTIFICATION_EVENTS } = require('../notifications/notification.constants');
            notificationsToEmit.push({
              type: NOTIFICATION_EVENTS.PAYMENT_SUCCESSFUL,
              recipient: { _id: payment.customerId, role: 'CUSTOMER' },
              entity: payment
            });
            const pharmacy = await Pharmacy.findById(payment.pharmacyId).session(session);
            if (pharmacy) {
              notificationsToEmit.push({
                type: NOTIFICATION_EVENTS.PAYMENT_SUCCESSFUL,
                recipient: { _id: pharmacy.ownerUserId, role: 'PHARMACY' },
                entity: payment
              });
            }
            
            const User = require('../users/user.model');
            const admins = await User.find({ role: 'ADMIN' }).session(session);
            for (const admin of admins) {
              notificationsToEmit.push({
                type: NOTIFICATION_EVENTS.PAYMENT_SUCCESSFUL,
                recipient: admin,
                entity: payment
              });
            }
          }

          if (order && order.paymentStatus !== PAYMENT_STATUS.PAID) {
            order.paymentMethod = PAYMENT_METHOD.CARD;
            order.paymentStatus = PAYMENT_STATUS.PAID;
            
            // Only update order status if it's PENDING_PAYMENT
            if (order.orderStatus === ORDER_STATUS.PENDING_PAYMENT) {
              order.statusHistory.push({
                status: ORDER_STATUS.PAYMENT_CONFIRMED,
                previousStatus: order.orderStatus,
                actorRole: 'SYSTEM',
                changeSource: 'PAYMENT_GATEWAY',
                note: `Payment successful via ${provider}`
              });
              order.orderStatus = ORDER_STATUS.PAYMENT_CONFIRMED;

              // Deduct stock since the order is now confirmed
              const availabilityService = require('../availability/availability.service');
              await availabilityService.deductStockForOrder(order, session);
            }
            order.paymentId = payment._id;
            await order.save({ session });
          }
          break;

        case GATEWAY_EVENT.PAYMENT_FAILED:
          if (payment.status !== PAYMENT_STATUS.FAILED && payment.status !== PAYMENT_STATUS.PAID) {
            payment.status = PAYMENT_STATUS.FAILED;
            payment.failureCode = 'WEBHOOK_FAILED';
            payment.failureMessage = 'Payment failed during asynchronous processing';
            await payment.save({ session });

            const { NOTIFICATION_EVENTS } = require('../notifications/notification.constants');
            notificationsToEmit.push({
              type: NOTIFICATION_EVENTS.PAYMENT_FAILED,
              recipient: { _id: payment.customerId, role: 'CUSTOMER' },
              entity: payment
            });
            
            const User = require('../users/user.model');
            const admins = await User.find({ role: 'ADMIN' }).session(session);
            for (const admin of admins) {
              notificationsToEmit.push({
                type: NOTIFICATION_EVENTS.PAYMENT_FAILED,
                recipient: admin,
                entity: payment
              });
            }
          }
          break;

        case GATEWAY_EVENT.CHECKOUT_CANCELLED:
          if (payment.status !== PAYMENT_STATUS.CANCELLED && payment.status !== PAYMENT_STATUS.PAID) {
            payment.status = PAYMENT_STATUS.CANCELLED;
            payment.cancelledAt = new Date();
            await payment.save({ session });
          }
          break;
      }
    }

    // 5. Mark event as processed
    paymentEvent.processed = true;
    paymentEvent.processingStatus = 'SUCCESS';
    paymentEvent.processedAt = new Date();
    if (payment) {
      paymentEvent.paymentId = payment._id;
      paymentEvent.orderId = payment.orderId;
    }
    await paymentEvent.save({ session });

    await session.commitTransaction();

    // Emit queued notifications outside transaction
    const { createAndEmitNotification } = require('../notifications/notification.service');
    for (const notif of notificationsToEmit) {
      try {
        await createAndEmitNotification(notif);
      } catch (err) {
        console.error('Failed to emit payment notification:', err);
      }
    }

  } catch (error) {
    await session.abortTransaction();
    
    // Attempt to log the error to the event, but outside the aborted transaction
    try {
      paymentEvent.processed = true;
      paymentEvent.processingStatus = 'ERROR';
      paymentEvent.processingError = error.message;
      paymentEvent.processedAt = new Date();
      await paymentEvent.save();
    } catch (saveError) {
      // Ignore save error during fallback
    }

    throw error;
  } finally {
    session.endSession();
  }

  return { acknowledged: true, alreadyProcessed: false };
};

/**
 * Select Cash on Delivery (COD) as the payment method for an order
 */
exports.selectCOD = async (orderId, customerId) => {
  const session = await Order.startSession();
  try {
    session.startTransaction();

    const order = await Order.findOne({ _id: orderId, customerId }).session(session);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    if (order.orderStatus !== ORDER_STATUS.PENDING_PAYMENT) {
      throw new ApiError('Order is not in a state that accepts payment', 400);
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID || order.paymentStatus === PAYMENT_STATUS.COD_PENDING) {
      throw new ApiError('An active or successful payment already exists for this order', 400);
    }

    const pharmacy = await Pharmacy.findById(order.pharmacyId).session(session);
    if (!pharmacy || !pharmacy.codAvailable) {
      throw new ApiError('Cash on Delivery is not available for this pharmacy', 400);
    }

    const payment = new Payment({
      paymentNumber: generatePaymentNumber(),
      orderId: order._id,
      customerId: customerId,
      pharmacyId: order.pharmacyId,
      method: PAYMENT_METHOD.COD,
      provider: PAYMENT_PROVIDER.COD,
      currency: order.currency || env.DEFAULT_CURRENCY,
      amount: order.total,
      status: PAYMENT_STATUS.COD_PENDING
    });

    await payment.save({ session });

    order.paymentMethod = PAYMENT_METHOD.COD;
    order.paymentStatus = PAYMENT_STATUS.COD_PENDING;
    order.orderStatus = ORDER_STATUS.PAYMENT_CONFIRMED;
    order.paymentId = payment._id;
    order.statusHistory.push({
      status: ORDER_STATUS.PAYMENT_CONFIRMED,
      previousStatus: ORDER_STATUS.PENDING_PAYMENT,
      actorRole: 'CUSTOMER',
      changeSource: 'SYSTEM',
      note: 'Customer selected Cash on Delivery'
    });

    // Deduct stock since the order is now confirmed
    const availabilityService = require('../availability/availability.service');
    await availabilityService.deductStockForOrder(order, session);

    await order.save({ session });

    await session.commitTransaction();

    return {
      paymentId: payment._id,
      paymentNumber: payment.paymentNumber,
      status: payment.status
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Mark a COD payment as collected by the pharmacy
 */
exports.collectCOD = async (orderId, pharmacyUserId) => {
  const session = await Order.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Verify pharmacy owns this order (pharmacyUserId matches ownerUserId)
    const pharmacy = await Pharmacy.findOne({ ownerUserId: pharmacyUserId }).session(session);
    if (!pharmacy || order.pharmacyId.toString() !== pharmacy._id.toString()) {
      throw new ApiError('Not authorized to collect payment for this order', 403);
    }

    if (order.paymentMethod !== PAYMENT_METHOD.COD || order.paymentStatus !== PAYMENT_STATUS.COD_PENDING) {
      throw new ApiError('Order is not pending COD collection', 400);
    }

    const allowedStatuses = [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED];
    if (!allowedStatuses.includes(order.orderStatus)) {
      throw new ApiError('Order must be in a fulfillable state to collect COD', 400);
    }

    const payment = await Payment.findById(order.paymentId).session(session);
    if (!payment) {
      throw new ApiError('Payment record not found', 404);
    }

    payment.status = PAYMENT_STATUS.COD_COLLECTED;
    payment.codCollectedAt = new Date();
    payment.codCollectedBy = pharmacyUserId;
    await payment.save({ session });

    order.paymentStatus = PAYMENT_STATUS.COD_COLLECTED;
    await order.save({ session });

    await session.commitTransaction();

    return {
      paymentId: payment._id,
      paymentNumber: payment.paymentNumber,
      status: payment.status
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get all payments for admin monitoring
 */
exports.getAllPayments = async (query = {}) => {
  // Simple filter mapped from query
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.method) filter.method = query.method;

  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .populate('customerId', 'fullName phone')
    .populate('pharmacyId', 'name email')
    .limit(100); // hard limit for now

  return payments;
};
