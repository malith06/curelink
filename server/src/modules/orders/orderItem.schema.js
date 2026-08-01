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
    genericName: { type: String, required: true },
    brandName: { type: String },
    strength: { type: String },
    dosageForm: { type: String }
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
    enum: ['AVAILABLE', 'UNAVAILABLE', 'SUBSTITUTION_OFFERED'],
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
    genericName: { type: String },
    brandName: { type: String },
    strength: { type: String },
    dosageForm: { type: String }
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
