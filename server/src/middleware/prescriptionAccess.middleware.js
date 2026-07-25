const Prescription = require("../modules/prescriptions/prescription.model");
const MedicineRequest = require("../modules/requests/request.model");
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
  } else if (req.user.role === "PHARMACY") {
    const request = await MedicineRequest.findById(prescription.requestId);
    if (!request) {
      return next(new ApiError(404, "Associated medicine request not found"));
    }
    
    // Check if the pharmacy is in the selected pharmacies array
    const isSelected = request.selectedPharmacyIds.some(
      id => id.toString() === req.user._id.toString()
    );

    if (!isSelected) {
      return next(new ApiError(403, "Your pharmacy was not selected for this prescription request"));
    }
  } else if (req.user.role !== "ADMIN") {
    // If not Customer, Pharmacy, or Admin, deny access.
    return next(new ApiError(403, "Unauthorized role for prescription access"));
  }

  // We attach the prescription object so downstream controllers don't need to re-fetch
  req.prescription = prescription;
  next();
});
