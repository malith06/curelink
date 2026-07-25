const mongoose = require("mongoose");
const { VERIFICATION_STATUSES, VERIFICATION_RESULT } = require("./verification.constants");

const verifiedItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
  },
  requestItemId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isSupportedByPrescription: {
    type: String,
    enum: Object.values(VERIFICATION_RESULT),
    default: VERIFICATION_RESULT.UNCLEAR,
  },
  pharmacyNotes: String,
});

const verificationSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineRequest",
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pharmacistUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(VERIFICATION_STATUSES),
      default: VERIFICATION_STATUSES.PENDING,
    },
    verifiedItems: [verifiedItemSchema],
    verificationNotes: String,
    rejectionReason: String,
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PrescriptionVerification", verificationSchema);
