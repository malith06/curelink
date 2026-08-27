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
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: null,
    },
    dosage: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    isManualOverride: {
      type: Boolean,
      default: false,
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

// Helper function to calculate status based on stock
const calculateStatus = (stockQuantity) => {
  if (stockQuantity === null || stockQuantity === undefined) return null;
  if (stockQuantity <= 0) return AVAILABILITY_STATUS.UNAVAILABLE;
  if (stockQuantity <= 10) return AVAILABILITY_STATUS.LIMITED;
  return AVAILABILITY_STATUS.AVAILABLE;
};

// Hook for save
medicineAvailabilitySchema.pre('save', function () {
  if (!this.isManualOverride && this.stockQuantity !== null && this.stockQuantity !== undefined) {
    const autoStatus = calculateStatus(this.stockQuantity);
    if (autoStatus) {
      this.status = autoStatus;
    }
  }
});

// Hook for findOneAndUpdate
medicineAvailabilitySchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  
  // Need to handle both $set and direct updates depending on how mongoose structures it
  let setRef = update.$set || update;

  // Only auto-calculate if manual override is explicitly disabled or not being enabled
  const isManualOverride = setRef.isManualOverride;
  const stockQuantity = setRef.stockQuantity;
  
  if (isManualOverride === false || (isManualOverride === undefined && stockQuantity !== undefined && stockQuantity !== null)) {
      const autoStatus = calculateStatus(stockQuantity);
      if (autoStatus) {
          setRef.status = autoStatus;
      }
  }
});

// A pharmacy should only have one availability record per medicine
medicineAvailabilitySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

// Index for querying medicines by availability status
medicineAvailabilitySchema.index({ medicineId: 1, status: 1 });

// Index for querying a pharmacy's available inventory
medicineAvailabilitySchema.index({ pharmacyId: 1, status: 1 });

const MedicineAvailability = mongoose.model('MedicineAvailability', medicineAvailabilitySchema);

module.exports = MedicineAvailability;
