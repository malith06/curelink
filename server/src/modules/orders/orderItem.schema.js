const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  requestItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quotationItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineSnapshot: {
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String },
    manufacturer: { type: String }
  },
  requestedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  approvedQuantity: {
    type: Number,
    required: true,
    min: 0 // Can be 0 if unavailable
  },
  unitPrice: {
    type: Number, // Stored in cents
    required: true,
    min: 0
  },
  subtotal: {
    type: Number, // Stored in cents
    required: true,
    min: 0
  },
  availabilityResult: {
    type: String,
    enum: Object.values(require('../quotations/quotation.constants').AVAILABILITY_RESULT),
    required: true
  },
  substitutionOffered: {
    type: Boolean,
    default: false
  },
  substitutionMedicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  substitutionSnapshot: {
    name: { type: String },
    brand: { type: String },
    category: { type: String },
    manufacturer: { type: String }
  },
  substitutionNote: {
    type: String,
    maxlength: 300
  },
  customerAcknowledgementRequired: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = orderItemSchema;
