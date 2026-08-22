const mongoose = require('mongoose');
const crypto = require('crypto');
const quotationItemSchema = require('./quotationItem.schema');
const { QUOTATION_STATUS, DEFAULT_CURRENCY, CLOSED_REASON } = require('./quotation.constants');

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineRequest',
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
  items: [quotationItemSchema],
  currency: {
    type: String,
    default: DEFAULT_CURRENCY
  },
  subtotal: {
    type: Number, // Stored in cents
    min: 0,
    default: 0
  },
  deliveryFee: {
    type: Number, // Stored in cents
    min: 0,
    default: 0
  },
  total: {
    type: Number, // Stored in cents
    min: 0,
    default: 0
  },
  preparationMinutes: {
    type: Number,
    min: 5
  },
  deliveryAvailable: {
    type: Boolean,
    default: false
  },
  pickupAvailable: {
    type: Boolean,
    default: true
  },
  pharmacyNotes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(QUOTATION_STATUS),
    default: QUOTATION_STATUS.DRAFT
  },
  expiresAt: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  acceptedAt: {
    type: Date
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: {
    type: Date
  },
  closedReason: {
    type: String,
    enum: Object.values(CLOSED_REASON)
  }
}, { timestamps: true });

// Compound unique index to enforce one quotation per pharmacy per request
quotationSchema.index({ requestId: 1, pharmacyId: 1 }, { unique: true });

// Index for customers listing quotations for their request
quotationSchema.index({ requestId: 1, status: 1 });

// Index for pharmacies querying their own quotations
quotationSchema.index({ pharmacyId: 1, createdAt: -1 });

quotationSchema.pre('validate', async function() {
  if (this.isNew && !this.quotationNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.quotationNumber = `QUO-${dateStr}-${randomStr}`;
  }
});

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
