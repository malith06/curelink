const Prescription = require("../modules/prescriptions/prescription.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.checkPrescriptionAccess = asyncHandler(async (req, res, next) => {
  const { prescriptionId } = req.params;

  if (!prescriptionId) {
    return next(new ApiError(400, "Prescription ID is required"));
  }

  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) {
    return next(new ApiError(404, "Prescription not found"));
  }

  if (req.user.role === "CUSTOMER") {
    if (prescription.customerId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, "You do not have permission to access this prescription"));
    }
  }

  // We attach the prescription object so downstream controllers don't need to re-fetch
  req.prescription = prescription;
  next();
});
