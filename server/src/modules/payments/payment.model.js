const mongoose = require('mongoose');
const { PAYMENT_METHOD, PAYMENT_PROVIDER, PAYMENT_STATUS } = require('./payment.constants');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true
    },
    provider: {
      type: String,
      enum: Object.values(PAYMENT_PROVIDER),
      required: true
    },
    currency: {
      type: String,
      required: true,
      uppercase: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      required: true
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    gatewaySessionId: {
      type: String,
      sparse: true,
      unique: true
    },
    gatewayPaymentReference: {
      type: String,
      sparse: true,
      unique: true
    },
    gatewayCustomerReference: {
      type: String
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true
    },
    failureCode: {
      type: String
    },
    failureMessage: {
      type: String
    },
    cancelledAt: {
      type: Date
    },
    paidAt: {
      type: Date
    },
    codCollectedAt: {
      type: Date
    },
    codCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster lookups and ensuring constraints
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ pharmacyId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
