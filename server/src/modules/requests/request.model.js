const mongoose = require('mongoose');
const requestItemSchema = require('./requestItem.schema');
const { REQUEST_STATUS } = require('./request.constants');

const medicineRequestSchema = new mongoose.Schema({
  requestNumber: {
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
  items: [requestItemSchema],
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  customerLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  selectedPharmacyIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  }],
  status: {
    type: String,
    enum: Object.values(REQUEST_STATUS),
    default: REQUEST_STATUS.DRAFT
  },
  expiresAt: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: 300
  }
}, { timestamps: true });

// We'll add indexes in the next commit (Unit 4)

const MedicineRequest = mongoose.model('MedicineRequest', medicineRequestSchema);

module.exports = MedicineRequest;
