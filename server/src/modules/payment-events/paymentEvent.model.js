const mongoose = require('mongoose');

const paymentEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true
    },
    eventId: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    signatureVerified: {
      type: Boolean,
      default: false
    },
    processed: {
      type: Boolean,
      default: false
    },
    processingStatus: {
      type: String,
      enum: ['SUCCESS', 'ERROR']
    },
    processingError: {
      type: String
    },
    receivedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate processing of the same gateway event
paymentEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

const PaymentEvent = mongoose.model('PaymentEvent', paymentEventSchema);

module.exports = PaymentEvent;
