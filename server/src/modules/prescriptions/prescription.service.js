const crypto = require("crypto");
const FileType = require("file-type");
const Prescription = require("./prescription.model");
const MedicineRequest = require("../requests/request.model");
const cloudinaryAdapter = require("../storage/cloudinary.adapter");
const ApiError = require("../../utils/ApiError");
const { UPLOAD_STATUSES, OCR_STATUSES } = require("./prescription.constants");
const { REQUEST_STATUS } = require("../requests/request.constants");

class PrescriptionService {
  /**
   * Validates the file buffer magic bytes against allowed MIME types.
   */
  async validateFileSignature(buffer, expectedMime) {
    const fileTypeInfo = await FileType.fromBuffer(buffer);
    if (!fileTypeInfo) {
      throw new ApiError(400, "Could not determine file type signature. File might be corrupted or empty.");
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(fileTypeInfo.mime)) {
      throw new ApiError(400, "Invalid file signature. Only JPG, PNG, and PDF are allowed.");
    }
    
    // Check if magic bytes match the claimed mime from multer
    if (fileTypeInfo.mime !== expectedMime) {
      throw new ApiError(400, "File extension and MIME type do not match the actual file content.");
    }
    
    return true;
  }

  /**
   * Uploads a new prescription.
   */
  async uploadPrescription(customerId, requestId, file) {
    // 1. Fetch request and check ownership & status
    const request = await MedicineRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Medicine request not found");
    }
    if (request.customerId.toString() !== customerId.toString()) {
      throw new ApiError(403, "You do not have permission to upload to this request");
    }
    if (![REQUEST_STATUS.DRAFT, REQUEST_STATUS.SUBMITTED].includes(request.status)) {
      throw new ApiError(400, "Request status does not allow prescription upload");
    }
    if (request.prescriptionId) {
      throw new ApiError(400, "Request already has an active prescription. Use the replace endpoint.");
    }

    // 2. Validate magic bytes
    await this.validateFileSignature(file.buffer, file.mimetype);

    // 3. Upload securely via adapter
    const safeFileName = crypto.randomBytes(8).toString("hex") + "-" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "");
    
    let uploadedFile;
    try {
      uploadedFile = await cloudinaryAdapter.uploadFile(file.buffer, {
        folder: "curelink_prescriptions",
      });
    } catch (error) {
      throw new ApiError(500, `Storage upload failed: ${error.message}`);
    }

    // 4. Create database record
    const prescription = await Prescription.create({
      customerId,
      requestId,
      originalFileName: file.originalname,
      safeFileName,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      storageProvider: "cloudinary",
      storagePublicId: uploadedFile.publicId,
      storageResourceType: uploadedFile.resourceType,
      storageFormat: uploadedFile.format,
      uploadStatus: UPLOAD_STATUSES.UPLOADED,
      ocrStatus: OCR_STATUSES.PENDING,
    });

    // 5. Link prescription to request (We do NOT save it yet, wait for confirmation step per prompt)
    // Actually, the prompt says "Prescription upload must not automatically submit a draft request." 
    // And "When the customer confirms OCR results: ... Set request prescriptionId."
    // So we DON'T link it in the request model yet, or we only link it when OCR is confirmed.
    // Wait, the prompt says "Update request prescriptionId" is part of the confirmation step. 
    // BUT, how do we know the active prescription for a request before confirmation?
    // The query will look up Prescription by `requestId` and `isActive: true`.
    
    return prescription;
  }
}

module.exports = new PrescriptionService();
