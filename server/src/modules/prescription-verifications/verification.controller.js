const verificationService = require("./verification.service");
const { validateVerificationSubmission } = require("./verification.validation");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * Submits a manual prescription verification from a pharmacist.
 */
exports.submitVerification = asyncHandler(async (req, res, next) => {
  const { prescriptionId } = req.params;
  
  const Pharmacy = require('../pharmacies/pharmacy.model');
  const pharmacy = await Pharmacy.findOne({ ownerUserId: req.user._id }).lean();
  if (!pharmacy) throw new ApiError('Pharmacy profile not found', 404);
  
  const pharmacyId = pharmacy._id;
  const pharmacistId = req.user._id;

  // For real world, we would check if req.user is a pharmacist belonging to pharmacyId.
  if (req.user.role !== "PHARMACY") {
    return next(new ApiError(403, "Only pharmacies can submit verifications"));
  }

  // Validate the incoming verification data
  const { error, value } = validateVerificationSubmission(req.body);
  if (error) {
    return next(new ApiError(400, `Validation Error: ${error.details.map(x => x.message).join(', ')}`));
  }

  const verification = await verificationService.submitVerification(
    prescriptionId,
    pharmacyId,
    pharmacistId,
    value
  );

  res.status(200).json({
    success: true,
    data: verification,
  });
});
