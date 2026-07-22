const mongoose = require('mongoose');
const { AVAILABILITY_STATUS_ARRAY, AVAILABILITY_STATUS } = require('./availability.constants');

const medicineAvailabilitySchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    status: {
      type: String,
      enum: AVAILABILITY_STATUS_ARRAY,
      default: AVAILABILITY_STATUS.UNAVAILABLE,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// A pharmacy should only have one availability record per medicine
medicineAvailabilitySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

// Index for querying medicines by availability status
medicineAvailabilitySchema.index({ medicineId: 1, status: 1 });

// Index for querying a pharmacy's available inventory
medicineAvailabilitySchema.index({ pharmacyId: 1, status: 1 });

const MedicineAvailability = mongoose.model('MedicineAvailability', medicineAvailabilitySchema);

module.exports = MedicineAvailability;
