const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  requestItemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  availabilityStatus: {
    type: String,
    enum: ['AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'CONFIRMATION_REQUIRED'],
    required: true
  },
  availableQuantity: { 
    type: Number,
    min: 0 
  },
  unitPrice: { 
    type: Number,
    min: 0 
  },
  subTotal: {
    type: Number,
    min: 0
  }
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  pharmacyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pharmacy', 
    required: true 
  },
  items: [quotationItemSchema],
  totalAmount: { 
    type: Number, 
    default: 0 
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
    default: 'PENDING'
  },
  quotedAt: { 
    type: Date, 
    default: Date.now 
  },
  validUntil: { 
    type: Date 
  },
  notes: {
    type: String,
    maxlength: 300
  }
}, { _id: true, timestamps: true });

module.exports = quotationSchema;
