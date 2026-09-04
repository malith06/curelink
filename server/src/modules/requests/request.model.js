const mongoose = require('mongoose');
const crypto = require('crypto');
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
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  prescriptionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
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
  acceptedQuotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    default: null
  },
  quotationCount: {
    type: Number,
    default: 0
  },
  firstQuotationReceivedAt: {
    type: Date
  },
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
  },
  statusTimeline: [{
    status: {
      type: String,
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

medicineRequestSchema.pre('validate', async function() {
  if (this.isNew && !this.requestNumber) {
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await mongoose.models.MedicineRequest.findOne({ requestNumber: randomNum });
      if (!existing) {
        this.requestNumber = randomNum;
        isUnique = true;
      }
    }
  }
});

medicineRequestSchema.pre('save', async function() {
  if (this.isModified('status')) {
    this.statusTimeline.push({
      status: this.status,
      changedAt: new Date()
    });
  }
});

// Index for a customer querying their own requests efficiently
medicineRequestSchema.index({ customerId: 1, createdAt: -1 });

// Index for pharmacies checking their inbox for specific status
medicineRequestSchema.index({ selectedPharmacyIds: 1, status: 1, createdAt: -1 });

// Geospatial index for future analytics or location-based request routing
medicineRequestSchema.index({ customerLocation: '2dsphere' });

const MedicineRequest = mongoose.model('MedicineRequest', medicineRequestSchema);

module.exports = MedicineRequest;
