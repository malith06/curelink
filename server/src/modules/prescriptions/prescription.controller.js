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

/**
 * Triggers OCR processing for a prescription.
 */
exports.processOcr = asyncHandler(async (req, res, next) => {
  const prescription = req.prescription;
  
  // This can take some time, in a production environment this should be queued.
  // For MVP, we await it synchronously.
  const updatedPrescription = await prescriptionService.processOcr(prescription);
  
  res.status(200).json({
    success: true,
    data: {
      ocrStatus: updatedPrescription.ocrStatus,
      rawExtractedText: updatedPrescription.rawExtractedText,
    },
  });
});

/**
 * Fetches the current OCR results and status for a prescription.
 */
exports.getOcrResults = asyncHandler(async (req, res, next) => {
  // We need to populate the medicine details to return them to the client
  await req.prescription.populate('extractedMedicines.matchedMedicineId', 'name manufacturer category');
  
  const prescription = req.prescription;
  
  res.status(200).json({
    success: true,
    data: {
      ocrStatus: prescription.ocrStatus,
      rawExtractedText: prescription.rawExtractedText,
      extractedMedicines: prescription.extractedMedicines,
    },
  });
});

/**
 * Updates OCR entries based on customer corrections/confirmations.
 */
exports.updateOcrEntries = asyncHandler(async (req, res, next) => {
  const { entries } = req.body;
  
  if (!Array.isArray(entries)) {
    return next(new ApiError(400, "Entries must be an array"));
  }

  const updatedPrescription = await prescriptionService.updateOcrEntries(req.prescription, entries);

  res.status(200).json({
    success: true,
    data: {
      extractedMedicines: updatedPrescription.extractedMedicines,
    },
  });
});
