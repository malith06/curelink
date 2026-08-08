const mongoose = require('mongoose');
const { NOTIFICATION_EVENTS, NOTIFICATION_ENTITY_TYPES } = require('./notification.constants');

const notificationSchema = new mongoose.Schema(
  {
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient User ID is required']
    },
    recipientRole: {
      type: String,
      enum: ['CUSTOMER', 'PHARMACY', 'ADMIN'],
      required: [true, 'Recipient Role is required']
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_EVENTS),
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    entityType: {
      type: String,
      enum: Object.values(NOTIFICATION_ENTITY_TYPES)
    },
    entityId: {
      type: String // Using String to safely hold ObjectId or plain string IDs (like REQ-XXXX)
    },
    relatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineRequest'
    },
    relatedQuotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation'
    },
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    relatedPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    actionUrl: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    eventKey: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast querying of a user's notifications
notificationSchema.index({
  recipientUserId: 1,
  createdAt: -1
});

notificationSchema.index({
  recipientUserId: 1,
  isRead: 1,
  createdAt: -1
});

module.exports = mongoose.model('Notification', notificationSchema);
