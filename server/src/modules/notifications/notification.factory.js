const { NOTIFICATION_EVENTS, NOTIFICATION_ENTITY_TYPES } = require('./notification.constants');

/**
 * Builds a unique event key to prevent duplicate notifications.
 */
const buildEventKey = (type, entityId, recipientUserId, version = '') => {
  return `${type}:${entityId}:${recipientUserId}${version ? `:${version}` : ''}`;
};

/**
 * Helper to get a human-readable short ID for entities.
 */
const getShortId = (entity, context = {}) => {
  if (entity?.orderNumber) return `#${entity.orderNumber}`;
  if (entity?.shortId) return `#${entity.shortId}`;
  if (context?.requestShortId) return `#${context.requestShortId}`;
  if (entity?._id) {
    const idStr = entity._id.toString();
    return `#${idStr.substring(idStr.length - 6).toUpperCase()}`;
  }
  return 'Unknown';
};

/**
 * Factory to generate standardized notification payloads.
 * Strips sensitive data and generates safe action URLs.
 */
const createNotificationPayload = ({ type, recipient, entity, context = {} }) => {
  let title, message, actionUrl, entityType, eventKey;
  let metadata = {};
  
  const recipientRole = recipient?.role;
  const recipientUserId = recipient?._id?.toString() || recipient?.id || 'unknown';

  switch (type) {
    case NOTIFICATION_EVENTS.REQUEST_RECEIVED:
      title = 'New Medicine Request';
      message = `New medicine request ${getShortId(entity)} has been received.`;
      actionUrl = `/pharmacy/requests/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.REQUEST;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      metadata = { requestNumber: entity.shortId || entity._id.toString() };
      break;

    case NOTIFICATION_EVENTS.QUOTATION_RECEIVED:
      title = 'New Quotation Received';
      message = `A new private quotation has been received for request ${getShortId(null, context)}.`;
      actionUrl = `/customer/requests/${context.requestId}`;
      entityType = NOTIFICATION_ENTITY_TYPES.QUOTATION;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      metadata = { quotationId: entity._id.toString(), requestId: context.requestId };
      break;

    case NOTIFICATION_EVENTS.QUOTATION_ACCEPTED:
      title = 'Quotation Accepted';
      message = `Your quotation ${getShortId(entity)} has been accepted.`;
      actionUrl = `/pharmacy/orders`; // Assuming quotation acceptance leads to order workflow
      entityType = NOTIFICATION_ENTITY_TYPES.QUOTATION;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.PAYMENT_SUCCESSFUL:
      title = 'Payment Successful';
      if (recipientRole === 'CUSTOMER') {
        message = `Payment for order ${getShortId(entity)} was confirmed successfully.`;
        actionUrl = `/customer/orders/${entity._id}`;
      } else if (recipientRole === 'ADMIN') {
        message = `A payment of LKR ${entity.amount} was confirmed for order ${entity.orderId ? `#${entity.orderId}` : getShortId(entity)}.`;
        actionUrl = `/admin/payments`;
      } else {
        message = `Payment has been confirmed for order ${getShortId(entity)}.`;
        actionUrl = `/pharmacy/orders/${entity._id}`;
      }
      entityType = NOTIFICATION_ENTITY_TYPES.PAYMENT;
      eventKey = buildEventKey(type, context.paymentId || entity._id, recipientUserId);
      metadata = { orderNumber: entity.shortId || entity._id.toString() };
      break;

    case NOTIFICATION_EVENTS.PAYMENT_FAILED:
      title = 'Payment Failed';
      if (recipientRole === 'ADMIN') {
        message = `Card payment for order ${entity.orderId ? `#${entity.orderId}` : getShortId(entity)} has failed.`;
        actionUrl = `/admin/payments`;
      } else {
        message = `Card payment for order ${getShortId(entity)} was unsuccessful. You may try again.`;
        actionUrl = `/customer/orders/${entity._id}/payment`;
      }
      entityType = NOTIFICATION_ENTITY_TYPES.PAYMENT;
      eventKey = buildEventKey(type, context.paymentId || entity._id, recipientUserId, Date.now().toString()); // Allow multiple failures
      break;

    case NOTIFICATION_EVENTS.ORDER_ACCEPTED:
      title = 'Order Accepted';
      message = `Your order ${getShortId(entity)} has been accepted by the pharmacy.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_PREPARING:
      title = 'Order Preparing';
      message = `Your order ${getShortId(entity)} is being prepared.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_READY:
      title = 'Order Ready';
      message = `Your order ${getShortId(entity)} is ready for pickup.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_OUT_FOR_DELIVERY:
      title = 'Order Out for Delivery';
      message = `Your order ${getShortId(entity)} is out for delivery.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_DELIVERED:
      title = 'Order Delivered';
      message = `Your order ${getShortId(entity)} has been delivered.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_COMPLETED:
      title = 'Order Completed';
      message = `Your order ${getShortId(entity)} has been completed successfully.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_CANCELLED:
      title = 'Order Cancelled';
      message = `Order ${getShortId(entity)} has been cancelled.`;
      actionUrl = recipientRole === 'CUSTOMER' ? `/customer/orders/${entity._id}` : `/pharmacy/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_REJECTED:
      title = 'Order Rejected';
      message = `Your order ${getShortId(entity)} was rejected by the pharmacy.`;
      if (context.reason) {
        metadata.reason = context.reason;
      }
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.PRESCRIPTION_VERIFIED:
      title = 'Prescription Verified';
      message = `The pharmacy has completed prescription review for request ${getShortId(entity)}.`;
      actionUrl = `/customer/requests/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.PRESCRIPTION;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.PRESCRIPTION_REJECTED:
      title = 'Prescription Rejected';
      message = `The prescription for request ${entity.shortId || entity._id} was rejected.`;
      actionUrl = `/customer/requests/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.PRESCRIPTION;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      if (context.reason) {
        metadata.reason = context.reason;
      }
      break;

    case NOTIFICATION_EVENTS.PHARMACY_SUBMITTED:
      title = 'New Pharmacy Registration';
      message = `Pharmacy ${entity.name || 'Profile'} has submitted their profile for verification.`;
      actionUrl = `/admin/pharmacies/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.PHARMACY;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.PHARMACY_APPROVED:
      title = 'Pharmacy Approved';
      message = `Your pharmacy profile has been approved! You can now receive orders.`;
      actionUrl = `/pharmacy/dashboard`;
      entityType = NOTIFICATION_ENTITY_TYPES.PHARMACY;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.PHARMACY_REJECTED:
      title = 'Pharmacy Rejected';
      message = `Your pharmacy profile has been rejected. Please check the rejection notes.`;
      actionUrl = `/pharmacy/profile`;
      entityType = NOTIFICATION_ENTITY_TYPES.PHARMACY;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      if (context.reason) {
        metadata.reason = context.reason;
      }
      break;

    default:
      throw new Error(`Unsupported notification type: ${type}`);
  }

  return {
    recipientUserId,
    recipientRole,
    type,
    title,
    message,
    entityType,
    entityId: entity?._id?.toString() || entity?.id || 'unknown',
    actionUrl,
    eventKey,
    metadata,
    isRead: false
  };
};

module.exports = {
  createNotificationPayload,
  buildEventKey
};
