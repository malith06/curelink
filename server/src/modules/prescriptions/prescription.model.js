const mongoose = require("mongoose");
const { 
  UPLOAD_STATUSES, 
  OCR_STATUSES, 
  CUSTOMER_REVIEW_STATUSES, 
  CUSTOMER_ACTIONS 
} = require("./prescription.constants");

const extractedMedicineSchema = new mongoose.Schema({
  entryId: {
    type: String,
    required: true,
  },
  rawDetectedText: {
    type: String,
    required: true,
  },
  matchedMedicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
  },
  medicineSnapshot: {
    name: String,
    brand: String,
    category: String,
    manufacturer: String,
  },
  candidateMatches: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
    },
    displayName: String,
    score: Number,
  }],
  matchConfidence: {
    type: Number,
  },
  ocrConfidence: {
    type: Number,
  },
  strengthText: String,
  dosageFormText: String,
  quantity: {
    type: Number,
    default: 1,
  },
  instructionsText: String,
  customerAction: {
    type: String,
    enum: Object.values(CUSTOMER_ACTIONS),
    default: CUSTOMER_ACTIONS.PENDING_REVIEW,
  },
  customerCorrectedName: String,
  customerNotes: String,
  needsManualReview: {
    type: Boolean,
    default: false,
  },
  sourcePage: {
    type: Number,
  },
}, { timestamps: true });

const prescriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineRequest",
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    safeFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    storageProvider: {
      type: String,
      default: "cloudinary",
    },
    storagePublicId: {
      type: String,
      required: true,
    },
    storageResourceType: String,
    storageFormat: String,
    uploadStatus: {
      type: String,
      enum: Object.values(UPLOAD_STATUSES),
      default: UPLOAD_STATUSES.UPLOADING,
    },
    ocrStatus: {
      type: String,
      enum: Object.values(OCR_STATUSES),
      default: OCR_STATUSES.PENDING,
    },
    rawExtractedText: {
      type: String,
      select: false, // Ensure raw text is not returned by default for privacy
    },
    normalisedText: {
      type: String,
      select: false,
    },
    overallConfidence: Number,
    ocrWarnings: [String],
    extractedMedicines: [extractedMedicineSchema],
    customerReviewStatus: {
      type: String,
      enum: Object.values(CUSTOMER_REVIEW_STATUSES),
      default: CUSTOMER_REVIEW_STATUSES.NOT_REVIEWED,
    },
    customerConfirmedAt: Date,
    processingStartedAt: Date,
    processingCompletedAt: Date,
    processingFailureReason: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    replacedPrescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ customerId: 1 });
prescriptionSchema.index({ requestId: 1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
