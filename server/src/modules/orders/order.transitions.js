const { ORDER_STATUS, FULFILMENT_METHOD } = require('./order.constants');

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING_PAYMENT]: [
    ORDER_STATUS.PAYMENT_CONFIRMED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REJECTED
  ],
  [ORDER_STATUS.PAYMENT_CONFIRMED]: [
    ORDER_STATUS.PHARMACY_ACCEPTED,
    ORDER_STATUS.REJECTED,
    ORDER_STATUS.CANCELLED // For future payment refund rules
  ],
  [ORDER_STATUS.PHARMACY_ACCEPTED]: [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.CANCELLED // Authorized exceptional flow
  ],
  [ORDER_STATUS.PREPARING]: [
    ORDER_STATUS.READY_FOR_PICKUP,
    ORDER_STATUS.OUT_FOR_DELIVERY
  ],
  [ORDER_STATUS.READY_FOR_PICKUP]: [
    ORDER_STATUS.COMPLETED
  ],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [
    ORDER_STATUS.DELIVERED
  ],
  [ORDER_STATUS.DELIVERED]: [
    ORDER_STATUS.COMPLETED
  ],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REJECTED]: []
};

/**
 * Validates if the order can transition from current to next status.
 * Prevents invalid fulfillment-specific transitions (e.g. Pickup order becoming Out For Delivery).
 */
const isValidTransition = (currentStatus, nextStatus, fulfilmentMethod) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    return false;
  }

  // Fulfilment specific restrictions
  if (nextStatus === ORDER_STATUS.READY_FOR_PICKUP && fulfilmentMethod !== FULFILMENT_METHOD.PICKUP) {
    return false;
  }

  if (nextStatus === ORDER_STATUS.OUT_FOR_DELIVERY && fulfilmentMethod !== FULFILMENT_METHOD.DELIVERY) {
    return false;
  }

  return true;
};

/**
 * Safely appends an entry to the append-only status history and updates current order status.
 */
const appendStatusHistory = (order, nextStatus, actorId, actorRole, changeSource, note) => {
  order.statusHistory.push({
    status: nextStatus,
    previousStatus: order.orderStatus,
    changedBy: actorId,
    actorRole,
    changeSource,
    note
  });
  
  order.orderStatus = nextStatus;
  
  // Set timestamp placeholders based on new status
  if (nextStatus === ORDER_STATUS.PHARMACY_ACCEPTED) order.acceptedAt = new Date();
  if (nextStatus === ORDER_STATUS.PREPARING) order.preparationStartedAt = new Date();
  if (nextStatus === ORDER_STATUS.READY_FOR_PICKUP) order.readyAt = new Date();
  if (nextStatus === ORDER_STATUS.OUT_FOR_DELIVERY) order.outForDeliveryAt = new Date();
  if (nextStatus === ORDER_STATUS.DELIVERED) order.deliveredAt = new Date();
  if (nextStatus === ORDER_STATUS.COMPLETED) order.completedAt = new Date();
};

module.exports = {
  ALLOWED_TRANSITIONS,
  isValidTransition,
  appendStatusHistory
};
