const mongoose = require('mongoose');
const { MEDICINE_SOURCE, REQUEST_UNITS } = require('./request.constants');

const medicineSnapshotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String },
  manufacturer: { type: String }
}, { _id: false });

const requestItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineSnapshot: {
    type: medicineSnapshotSchema,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  unit: {
    type: String,
    enum: Object.values(REQUEST_UNITS),
    default: REQUEST_UNITS.UNIT
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 300
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: Object.values(MEDICINE_SOURCE),
    default: MEDICINE_SOURCE.MANUAL_SEARCH
  }
}, { _id: true, timestamps: { createdAt: true, updatedAt: false } });

module.exports = requestItemSchema;
