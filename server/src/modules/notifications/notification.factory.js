const { NOTIFICATION_EVENTS, NOTIFICATION_ENTITY_TYPES } = require('./notification.constants');

/**
 * Builds a unique event key to prevent duplicate notifications.
 */
const buildEventKey = (type, entityId, recipientUserId, version = '') => {
  return `${type}:${entityId}:${recipientUserId}${version ? `:${version}` : ''}`;
};

/**
 * Factory to generate standardized notification payloads.
 * Strips sensitive data and generates safe action URLs.
 */
const createNotificationPayload = ({ type, recipient, entity, context = {} }) => {
  let title, message, actionUrl, entityType, eventKey;
  let metadata = {};
  
  const recipientRole = recipient.role;
  const recipientUserId = recipient._id.toString();

  switch (type) {
    case NOTIFICATION_EVENTS.REQUEST_RECEIVED:
      title = 'New Medicine Request';
      message = `New medicine request ${entity.shortId || entity._id} has been received.`;
      actionUrl = `/pharmacy/requests/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.REQUEST;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      metadata = { requestNumber: entity.shortId || entity._id.toString() };
      break;

    case NOTIFICATION_EVENTS.QUOTATION_RECEIVED:
      title = 'New Quotation Received';
      message = `A new private quotation has been received for request ${context.requestShortId || context.requestId}.`;
      actionUrl = `/customer/requests/${context.requestId}`;
      entityType = NOTIFICATION_ENTITY_TYPES.QUOTATION;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      metadata = { quotationId: entity._id.toString(), requestId: context.requestId };
      break;

    case NOTIFICATION_EVENTS.QUOTATION_ACCEPTED:
      title = 'Quotation Accepted';
      message = `Your quotation ${entity.shortId || entity._id} has been accepted.`;
      actionUrl = `/pharmacy/orders`; // Assuming quotation acceptance leads to order workflow
      entityType = NOTIFICATION_ENTITY_TYPES.QUOTATION;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.PAYMENT_SUCCESSFUL:
      title = 'Payment Successful';
      if (recipientRole === 'CUSTOMER') {
        message = `Payment for order ${entity.shortId || entity._id} was confirmed successfully.`;
        actionUrl = `/customer/orders/${entity._id}`;
      } else {
        message = `Payment has been confirmed for order ${entity.shortId || entity._id}.`;
        actionUrl = `/pharmacy/orders/${entity._id}`;
      }
      entityType = NOTIFICATION_ENTITY_TYPES.PAYMENT;
      eventKey = buildEventKey(type, context.paymentId || entity._id, recipientUserId);
      metadata = { orderNumber: entity.shortId || entity._id.toString() };
      break;

    case NOTIFICATION_EVENTS.PAYMENT_FAILED:
      title = 'Payment Failed';
      message = `Card payment for order ${entity.shortId || entity._id} was unsuccessful. You may try again.`;
      actionUrl = `/customer/orders/${entity._id}/payment`;
      entityType = NOTIFICATION_ENTITY_TYPES.PAYMENT;
      eventKey = buildEventKey(type, context.paymentId || entity._id, recipientUserId, Date.now().toString()); // Allow multiple failures
      break;

    case NOTIFICATION_EVENTS.ORDER_ACCEPTED:
      title = 'Order Accepted';
      message = `Your order ${entity.shortId || entity._id} has been accepted by the pharmacy.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_PREPARING:
      title = 'Order Preparing';
      message = `Your order ${entity.shortId || entity._id} is being prepared.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_READY:
      title = 'Order Ready';
      message = `Your order ${entity.shortId || entity._id} is ready for pickup.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_OUT_FOR_DELIVERY:
      title = 'Order Out for Delivery';
      message = `Your order ${entity.shortId || entity._id} is out for delivery.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_DELIVERED:
      title = 'Order Delivered';
      message = `Your order ${entity.shortId || entity._id} has been delivered.`;
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_CANCELLED:
      title = 'Order Cancelled';
      message = `Order ${entity.shortId || entity._id} has been cancelled.`;
      actionUrl = recipientRole === 'CUSTOMER' ? `/customer/orders/${entity._id}` : `/pharmacy/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.ORDER_REJECTED:
      title = 'Order Rejected';
      message = `Your order ${entity.shortId || entity._id} was rejected by the pharmacy.`;
      if (context.reason) {
        metadata.reason = context.reason;
      }
      actionUrl = `/customer/orders/${entity._id}`;
      entityType = NOTIFICATION_ENTITY_TYPES.ORDER;
      eventKey = buildEventKey(type, entity._id, recipientUserId);
      break;

    case NOTIFICATION_EVENTS.PRESCRIPTION_VERIFIED:
      title = 'Prescription Verified';
      message = `The pharmacy has completed prescription review for request ${entity.shortId || entity._id}.`;
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
    entityId: entity._id.toString(),
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
