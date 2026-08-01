const mongoose = require('mongoose');
const crypto = require('crypto');
const orderItemSchema = require('./orderItem.schema');
const {
  customerSnapshotSchema,
  pharmacySnapshotSchema,
  deliveryAddressSnapshotSchema
} = require('./orderSnapshots.schema');
const {
  ORDER_STATUS,
  FULFILMENT_METHOD,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  CHANGE_SOURCE
} = require('./order.constants');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    required: true
  },
  previousStatus: {
    type: String,
    enum: Object.values(ORDER_STATUS)
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actorRole: {
    type: String,
    required: true
  },
  changeSource: {
    type: String,
    enum: Object.values(CHANGE_SOURCE),
    required: true
  },
  note: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineRequest',
    required: true
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: true
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    default: null
  },
  items: [orderItemSchema],
  customerSnapshot: {
    type: customerSnapshotSchema,
    required: true
  },
  pharmacySnapshot: {
    type: pharmacySnapshotSchema,
    required: true
  },
  fulfilmentMethod: {
    type: String,
    enum: Object.values(FULFILMENT_METHOD),
    required: true
  },
  deliveryAddressSnapshot: {
    type: deliveryAddressSnapshotSchema,
    required: function() {
      return this.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY;
    }
  },
  deliveryInstructions: {
    type: String,
    maxlength: 500
  },
  subtotal: {
    type: Number, // cents
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number, // cents
    required: true,
    min: 0
  },
  total: {
    type: Number, // cents
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_METHOD),
    default: PAYMENT_METHOD.UNSELECTED
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  orderStatus: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING_PAYMENT
  },
  statusHistory: [statusHistorySchema],
  customerCancellation: {
    reason: { type: String, maxlength: 300 },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date }
  },
  pharmacyRejection: {
    reason: { type: String, maxlength: 500 },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date }
  },
  paymentId: { type: String }, // Placeholder for Day 9
  acceptedAt: { type: Date },
  preparationStartedAt: { type: Date },
  readyAt: { type: Date },
  outForDeliveryAt: { type: Date },
  deliveredAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  rejectedAt: { type: Date }
}, { timestamps: true });

// Enforce one order per accepted quotation
orderSchema.index({ quotationId: 1 }, { unique: true });

// Optimize customer fetching their own orders
orderSchema.index({ customerId: 1, createdAt: -1 });

// Optimize pharmacy fetching their assigned orders
orderSchema.index({ pharmacyId: 1, orderStatus: 1, createdAt: -1 });

// Generate unique order number
orderSchema.pre('validate', function(next) {
  if (this.isNew && !this.orderNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.orderNumber = `ORD-${dateStr}-${randomStr}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
