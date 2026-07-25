const asyncHandler = require("../../utils/asyncHandler");
const prescriptionService = require("./prescription.service");
const ApiError = require("../../utils/ApiError");

/**
 * Uploads a prescription and attaches it to a medicine request.
 */
exports.uploadPrescription = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const customerId = req.user._id;

  if (!req.file) {
    return next(new ApiError(400, "Prescription file is required"));
  }

  const prescription = await prescriptionService.uploadPrescription(
    customerId,
    requestId,
    req.file
  );

  res.status(201).json({
    success: true,
    data: {
      prescriptionId: prescription._id,
      requestId: prescription.requestId,
      safeFileName: prescription.safeFileName,
      mimeType: prescription.mimeType,
      fileSizeBytes: prescription.fileSizeBytes,
      uploadStatus: prescription.uploadStatus,
      ocrStatus: prescription.ocrStatus,
      createdAt: prescription.createdAt,
    },
  });
});

/**
 * Gets a short-lived signed URL to access a prescription file.
 */
exports.getPrescriptionAccessUrl = asyncHandler(async (req, res, next) => {
  // Assume `req.prescription` is attached by an ownership middleware
  const prescription = req.prescription;
  
  const url = await prescriptionService.getPrescriptionAccessUrl(prescription);
  
  res.status(200).json({
    success: true,
    data: {
      url,
      expiresIn: process.env.PRESCRIPTION_ACCESS_URL_EXPIRY_SECONDS || 300
    },
  });
});
