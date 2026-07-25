const PrescriptionVerification = require("./verification.model");
const Prescription = require("../prescriptions/prescription.model");
const ApiError = require("../../utils/ApiError");

class VerificationService {
  /**
   * Submits a pharmacist's manual verification for a prescription.
   * 
   * @param {String} prescriptionId 
   * @param {String} pharmacyId 
   * @param {String} pharmacistId 
   * @param {Object} verificationData 
   * @returns {Object} The created or updated verification record
   */
  async submitVerification(prescriptionId, pharmacyId, pharmacistId, verificationData) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      throw new ApiError(404, "Prescription not found");
    }

    if (prescription.customerReviewStatus !== require("../prescriptions/prescription.constants").CUSTOMER_REVIEW_STATUSES.CONFIRMED) {
      throw new ApiError(400, "Cannot verify a prescription that has not been confirmed by the customer");
    }

    // Upsert verification (a pharmacy only has one verification per prescription)
    const verification = await PrescriptionVerification.findOneAndUpdate(
      { prescriptionId, pharmacyId },
      {
        pharmacistId,
        verificationStatus: verificationData.verificationStatus,
        verifiedMedicines: verificationData.verifiedMedicines,
        generalNotes: verificationData.generalNotes,
        rejectionReason: verificationData.rejectionReason,
        verifiedAt: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );

    return verification;
  }
}

module.exports = new VerificationService();
