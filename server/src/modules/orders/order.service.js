const mongoose = require('mongoose');
const Order = require('./order.model');
const Quotation = require('../quotations/quotation.model');
const MedicineRequest = require('../requests/request.model');
const User = require('../users/user.model');
const Pharmacy = require('../pharmacies/pharmacy.model');
const ApiError = require('../../utils/ApiError');
const { REQUEST_STATUS } = require('../requests/request.constants');
const { ORDER_STATUS, FULFILMENT_METHOD, CHANGE_SOURCE } = require('./order.constants');
const {
  generateCustomerSnapshot,
  generatePharmacySnapshot,
  generateDeliveryAddressSnapshot,
  mapQuotationItemsToOrderItems
} = require('./order.utils');
const { isValidTransition, appendStatusHistory } = require('./order.transitions');

const createOrderFromQuotation = async (customerId, quotationId, payload) => {
  const session = await mongoose.startSession();
  let newOrder;

  try {
    await session.withTransaction(async () => {
      // 1. Idempotency Check
      const existingOrder = await Order.findOne({ quotationId }).session(session);
      if (existingOrder) {
        newOrder = existingOrder;
        return; // Return existing successfully
      }

      // 2. Fetch Quotation
      const quotation = await Quotation.findById(quotationId).session(session);
      if (!quotation) throw new ApiError('Quotation not found', 404);
      if (quotation.status !== 'ACCEPTED') {
        throw new ApiError('Only accepted quotations can be converted to orders', 400);
      }

      // 3. Fetch Request
      const request = await MedicineRequest.findById(quotation.requestId).session(session);
      if (!request) throw new ApiError('Associated request not found', 404);
      if (request.customerId.toString() !== customerId.toString()) {
        throw new ApiError('You do not have permission to create an order from this quotation', 403);
      }
      if (request.status !== REQUEST_STATUS.QUOTATION_ACCEPTED) {
        throw new ApiError('Request must be in QUOTATION_ACCEPTED status', 400);
      }

      // 4. Fetch User & Pharmacy for Snapshots
      const customer = await User.findById(customerId).session(session);
      const pharmacy = await Pharmacy.findById(quotation.pharmacyId).session(session);
      if (!customer || !pharmacy) {
        throw new ApiError('Missing customer or pharmacy profiles', 400);
      }

      // 5. Generate Snapshots & Item mappings
      const customerSnapshot = generateCustomerSnapshot(customer);
      const pharmacySnapshot = generatePharmacySnapshot(pharmacy);
      const deliveryAddressSnapshot = generateDeliveryAddressSnapshot(payload.deliveryAddress);
      
      const { items, subtotal } = mapQuotationItemsToOrderItems(quotation.items);
      const deliveryFee = payload.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? (quotation.deliveryFee || 0) : 0;
      const total = subtotal + deliveryFee;

      // 6. Build Order
      const orderDoc = new Order({
        customerId,
        pharmacyId: pharmacy._id,
        requestId: request._id,
        quotationId: quotation._id,
        prescriptionId: request.prescriptionId,
        items,
        customerSnapshot,
        pharmacySnapshot,
        fulfilmentMethod: payload.fulfilmentMethod,
        deliveryAddressSnapshot,
        deliveryInstructions: payload.deliveryInstructions,
        subtotal,
        deliveryFee,
        total,
        orderStatus: ORDER_STATUS.PENDING_PAYMENT,
        statusHistory: [{
          status: ORDER_STATUS.PENDING_PAYMENT,
          actorRole: 'CUSTOMER',
          changeSource: CHANGE_SOURCE.CUSTOMER,
          note: 'Order created from accepted quotation'
        }]
      });

      newOrder = await orderDoc.save({ session });

      // 7. Update Request Status
      request.status = REQUEST_STATUS.CONVERTED_TO_ORDER;
      request.orderId = newOrder._id;
      request.statusTimeline.push({
        status: REQUEST_STATUS.CONVERTED_TO_ORDER,
        changedAt: new Date()
      });
      await request.save({ session });
    });
  } finally {
    session.endSession();
  }

  return newOrder;
};

const getCustomerOrders = async (customerId, queryParams) => {
  const query = { customerId };
  if (queryParams?.status) {
    query.orderStatus = { $in: queryParams.status.split(',') };
  }
  return await Order.find(query)
    .select('-pharmacySnapshot.registrationNumber') // Hide sensitive pharmacy details
    .sort({ createdAt: -1 });
};

const getPharmacyOrders = async (pharmacyId, queryParams) => {
  const query = { pharmacyId };
  if (queryParams?.status) {
    query.orderStatus = { $in: queryParams.status.split(',') };
  }
  return await Order.find(query)
    .sort({ createdAt: -1 });
};

const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError('Order not found', 404);

  if (userRole === 'CUSTOMER' && order.customerId.toString() !== userId.toString()) {
    throw new ApiError('Unauthorized to view this order', 403);
  }
  
  if (userRole === 'PHARMACY' && order.pharmacyId.toString() !== userId.toString()) {
    throw new ApiError('Unauthorized to view this order', 403);
  }

  return order;
};

const cancelOrder = async (orderId, customerId, reason) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError('Order not found', 404);
  if (order.customerId.toString() !== customerId.toString()) throw new ApiError('Unauthorized', 403);

  if (!isValidTransition(order.orderStatus, ORDER_STATUS.CANCELLED, order.fulfilmentMethod)) {
    throw new ApiError('Order cannot be cancelled at this stage', 400);
  }

  appendStatusHistory(order, ORDER_STATUS.CANCELLED, customerId, 'CUSTOMER', CHANGE_SOURCE.CUSTOMER, reason);
  order.customerCancellation = { reason, cancelledBy: customerId, cancelledAt: new Date() };

  await order.save();

  // Notification: Customer cancelled the order
  try {
    const { createAndEmitNotification } = require('../notifications/notification.service');
    const { NOTIFICATION_EVENTS } = require('../notifications/notification.constants');
    const pharmacy = await Pharmacy.findById(order.pharmacyId);
    if (pharmacy) {
      await createAndEmitNotification({
        type: NOTIFICATION_EVENTS.ORDER_CANCELLED,
        recipient: { _id: pharmacy.ownerUserId, role: 'PHARMACY' },
        entity: order,
        context: { reason }
      });
    }
  } catch (err) {
    console.error('Failed to emit ORDER_CANCELLED notification:', err);
  }

  return order;
};

const rejectOrder = async (orderId, pharmacyId, reason) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError('Order not found', 404);
  if (order.pharmacyId.toString() !== pharmacyId.toString()) throw new ApiError('Unauthorized', 403);

  if (!isValidTransition(order.orderStatus, ORDER_STATUS.REJECTED, order.fulfilmentMethod)) {
    throw new ApiError('Order cannot be rejected at this stage', 400);
  }

  appendStatusHistory(order, ORDER_STATUS.REJECTED, pharmacyId, 'PHARMACY', CHANGE_SOURCE.PHARMACY, reason);
  order.pharmacyRejection = { reason, rejectedBy: pharmacyId, rejectedAt: new Date() };

  await order.save();

  // Notification: Pharmacy rejected the order
  try {
    const { createAndEmitNotification } = require('../notifications/notification.service');
    const { NOTIFICATION_EVENTS } = require('../notifications/notification.constants');
    await createAndEmitNotification({
      type: NOTIFICATION_EVENTS.ORDER_REJECTED,
      recipient: { _id: order.customerId, role: 'CUSTOMER' },
      entity: order,
      context: { reason }
    });
  } catch (err) {
    console.error('Failed to emit ORDER_REJECTED notification:', err);
  }

  return order;
};

const updateOrderStatus = async (orderId, pharmacyId, newStatus, note) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError('Order not found', 404);
  if (order.pharmacyId.toString() !== pharmacyId.toString()) throw new ApiError('Unauthorized', 403);

  if (!isValidTransition(order.orderStatus, newStatus, order.fulfilmentMethod)) {
    throw new ApiError(`Invalid transition from ${order.orderStatus} to ${newStatus} for ${order.fulfilmentMethod} order`, 400);
  }

  // Explicit security rule: Enforce payment state before pharmacy acceptance or preparation
  if (newStatus === ORDER_STATUS.PHARMACY_ACCEPTED || newStatus === ORDER_STATUS.PREPARING) {
    const { PAYMENT_STATUS } = require('./order.constants');
    if (order.paymentStatus !== PAYMENT_STATUS.PAID && order.paymentStatus !== PAYMENT_STATUS.COD_PENDING) {
      throw new ApiError('Cannot accept order without a confirmed payment or COD lock', 400);
    }
  }

  // If COD, mark payment as collected when delivered or completed
  if (newStatus === ORDER_STATUS.COMPLETED || newStatus === ORDER_STATUS.DELIVERED) {
    const { PAYMENT_STATUS } = require('./order.constants');
    if (order.paymentStatus === PAYMENT_STATUS.COD_PENDING) {
      order.paymentStatus = PAYMENT_STATUS.COD_COLLECTED;
    }
  }

  appendStatusHistory(order, newStatus, pharmacyId, 'PHARMACY', CHANGE_SOURCE.PHARMACY, note);
  await order.save();

  // Map order statuses to notification events
  const { NOTIFICATION_EVENTS } = require('../notifications/notification.constants');
  let notificationType = null;
  switch (newStatus) {
    case ORDER_STATUS.PHARMACY_ACCEPTED: notificationType = NOTIFICATION_EVENTS.ORDER_ACCEPTED; break;
    case ORDER_STATUS.PREPARING: notificationType = NOTIFICATION_EVENTS.ORDER_PREPARING; break;
    case ORDER_STATUS.READY_FOR_PICKUP: notificationType = NOTIFICATION_EVENTS.ORDER_READY; break;
    case ORDER_STATUS.OUT_FOR_DELIVERY: notificationType = NOTIFICATION_EVENTS.ORDER_OUT_FOR_DELIVERY; break;
    case ORDER_STATUS.DELIVERED: notificationType = NOTIFICATION_EVENTS.ORDER_DELIVERED; break;
    case ORDER_STATUS.COMPLETED: notificationType = NOTIFICATION_EVENTS.ORDER_COMPLETED; break;
  }

  if (notificationType) {
    try {
      const { createAndEmitNotification } = require('../notifications/notification.service');
      await createAndEmitNotification({
        type: notificationType,
        recipient: { _id: order.customerId, role: 'CUSTOMER' },
        entity: order
      });
    } catch (err) {
      console.error(`Failed to emit ${notificationType} notification:`, err);
    }
  }

  return order;
};

module.exports = {
  createOrderFromQuotation,
  getCustomerOrders,
  getPharmacyOrders,
  getOrderById,
  cancelOrder,
  rejectOrder,
  updateOrderStatus
};
