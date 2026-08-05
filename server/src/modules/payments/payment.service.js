const crypto = require('crypto');
const Order = require('../orders/order.model');
const Payment = require('./payment.model');
const stripeSandboxAdapter = require('../payment-gateways/stripeSandbox.adapter');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../orders/order.constants');
const { PAYMENT_PROVIDER } = require('./payment.constants');

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
      successUrl: env.PAYMENT_SUCCESS_URL,
      cancelUrl: env.PAYMENT_CANCEL_URL,
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
