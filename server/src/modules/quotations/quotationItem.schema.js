const mongoose = require('mongoose');
const { AVAILABILITY_RESULT } = require('./quotation.constants');

const medicineSnapshotSchema = new mongoose.Schema({
  genericName: { type: String, required: true },
  brandName: { type: String },
  strength: { type: String },
  dosageForm: { type: String }
}, { _id: false });

const quotationItemSchema = new mongoose.Schema({
  requestItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineSnapshot: {
    type: medicineSnapshotSchema,
    required: true
  },
  requestedQuantity: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  availableQuantity: {
    type: Number,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    },
    default: 0
  },
  availabilityResult: {
    type: String,
    enum: Object.values(AVAILABILITY_RESULT),
    default: AVAILABILITY_RESULT.UNAVAILABLE
  },
  unitPrice: {
    type: Number, // Stored in cents
    min: 0,
    default: null
  },
  subtotal: {
    type: Number, // Stored in cents
    min: 0,
    default: 0
  },
  substitutionOffered: {
    type: Boolean,
    default: false
  },
  substitutionMedicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    default: null
  },
  substitutionSnapshot: {
    type: medicineSnapshotSchema,
    default: null
  },
  substitutionNote: {
    type: String,
    maxlength: 300,
    trim: true,
    default: null
  },
  pharmacyItemNote: {
    type: String,
    maxlength: 300,
    trim: true,
    default: null
  }
}, { _id: true, timestamps: true });

module.exports = quotationItemSchema;
