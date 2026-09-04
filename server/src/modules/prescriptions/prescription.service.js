const mongoose = require("mongoose");
const crypto = require("crypto");
const FileType = require("file-type");
const Prescription = require("./prescription.model");
const MedicineRequest = require("../requests/request.model");
const cloudinaryAdapter = require("../storage/cloudinary.adapter");
const tesseractAdapter = require("../ocr/tesseract.adapter");
const pdfAdapter = require("../ocr/pdf.adapter");
const ocrUtils = require("../ocr/ocr.utils");
const Medicine = require("../medicines/medicine.model");
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
    if (request.prescriptionIds && request.prescriptionIds.length > 0) {
      // If there are existing prescriptions, we will allow adding more.
      // We could optionally limit the maximum number of prescriptions here (e.g., max 5).
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

    // 5. Link prescription to request (Temporarily link directly since OCR UI is bypassed)
    if (!request.prescriptionIds) {
      request.prescriptionIds = [];
    }
    request.prescriptionIds.push(prescription._id);
    await request.save();

    return prescription;
  }

  /**
   * Generates a short-lived signed URL for a prescription file.
   */
  async getPrescriptionAccessUrl(prescription) {
    if (!prescription.storagePublicId) {
      throw new ApiError(404, "Prescription file not found in storage");
    }

    const expirySeconds = process.env.PRESCRIPTION_ACCESS_URL_EXPIRY_SECONDS
      ? parseInt(process.env.PRESCRIPTION_ACCESS_URL_EXPIRY_SECONDS)
      : 300;

    const url = await cloudinaryAdapter.createAuthorisedAccessUrl(
      prescription.storagePublicId,
      prescription.storageFormat,
      prescription.storageResourceType,
      expirySeconds
    );

    return url;
  }

  /**
   * Processes OCR for a prescription.
   */
  async processOcr(prescription) {
    if (prescription.ocrStatus === OCR_STATUSES.COMPLETED) {
      throw new ApiError(400, "OCR has already been completed for this prescription");
    }

    // Mark as processing
    prescription.ocrStatus = OCR_STATUSES.PROCESSING;
    await prescription.save();

    try {
      // 1. Get a short-lived access URL to download the file securely
      const url = await this.getPrescriptionAccessUrl(prescription);

      // 2. Download the file into memory
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from storage. Status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Delegate to appropriate adapter
      let extractedText = "";
      if (prescription.mimeType === "application/pdf") {
        extractedText = await pdfAdapter.extractText(buffer, prescription.mimeType);
      } else {
        extractedText = await tesseractAdapter.extractText(buffer, prescription.mimeType);
      }

      // 4. Normalise text and extract potential names
      const potentialNames = ocrUtils.extractPotentialMedicineNames(extractedText);

      // 5. Fetch all medicines for matching (For MVP this is OK, in production we might use text search or elasticsearch)
      const allMedicines = await Medicine.find({}).lean();

      // 6. Match medicines and generate entries
      const matchedEntries = ocrUtils.findBestMatches(potentialNames, allMedicines);

      // 7. Update prescription with results
      prescription.rawExtractedText = extractedText;

      // If we got NO matches and text was empty, we can mark as MANUAL_ENTRY_REQUIRED
      if (!extractedText.trim() && matchedEntries.length === 0) {
        prescription.ocrStatus = OCR_STATUSES.MANUAL_ENTRY_REQUIRED;
        prescription.extractedMedicines = [];
      } else {
        prescription.extractedMedicines = matchedEntries;
        prescription.ocrStatus = OCR_STATUSES.COMPLETED;
      }

      await prescription.save();

      return prescription;
    } catch (error) {
      prescription.ocrStatus = OCR_STATUSES.FAILED;
      await prescription.save();
      throw new ApiError(500, `OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Updates extracted medicines based on customer corrections/confirmations.
   * Also serves as the fallback for manual entry.
   * 
   * @param {Object} prescription - The prescription document
   * @param {Array<Object>} newEntries - The customer-corrected entries
   * @returns {Object} Updated prescription
   */
  async updateOcrEntries(prescription, newEntries) {
    // Allow updating if completed, failed, or requires manual entry
    if (![OCR_STATUSES.COMPLETED, OCR_STATUSES.FAILED, OCR_STATUSES.MANUAL_ENTRY_REQUIRED].includes(prescription.ocrStatus)) {
      throw new ApiError(400, "Cannot update entries: OCR processing is not in a valid state.");
    }

    const { CUSTOMER_ACTIONS } = require("./prescription.constants");

    // Replace the current entries with the corrected ones, enforcing customer action states
    prescription.extractedMedicines = newEntries.map(entry => {
      const isManual = !entry.entryId; // If no original entry ID, it was manually added
      return {
        entryId: entry.entryId || new mongoose.Types.ObjectId().toString(),
        matchedMedicineId: entry.medicineId || null,
        rawDetectedText: entry.extractedText || "Manual Entry",
        ocrConfidence: entry.confidenceScore || 0,
        customerCorrectedName: entry.extractedText,
        quantity: entry.quantity || 1,
        customerAction: isManual ? CUSTOMER_ACTIONS.MANUALLY_ADDED : CUSTOMER_ACTIONS.CORRECTED,
      };
    });

    // If they provided manual entries, we can consider the OCR phase finalized
    if (prescription.ocrStatus === OCR_STATUSES.FAILED || prescription.ocrStatus === OCR_STATUSES.MANUAL_ENTRY_REQUIRED) {
      prescription.ocrStatus = OCR_STATUSES.COMPLETED; // We can mark the extraction phase complete manually
    }

    await prescription.save();
    return prescription;
  }

  /**
   * Confirms the customer review and syncs the matched items with the request.
   * 
   * @param {Object} prescription - The prescription document
   * @returns {Object} Updated prescription
   */
  async confirmPrescription(prescription) {
    if (prescription.customerReviewStatus === require("./prescription.constants").CUSTOMER_REVIEW_STATUSES.CONFIRMED) {
      throw new ApiError(400, "Prescription is already confirmed");
    }

    // 1. Mark prescription as confirmed
    const { CUSTOMER_REVIEW_STATUSES } = require("./prescription.constants");
    prescription.customerReviewStatus = CUSTOMER_REVIEW_STATUSES.CONFIRMED;
    prescription.customerConfirmedAt = new Date();
    await prescription.save();

    // 2. Sync with MedicineRequest
    const MedicineRequest = require("../requests/request.model");
    const request = await MedicineRequest.findById(prescription.requestId);

    if (request) {
      const Medicine = require("../medicines/medicine.model");

      // Clear existing OCR items if they came from THIS prescription, 
      // OR if they have NO sourcePrescriptionId (legacy, assume they belong to this one since we only had one before).
      request.items = request.items.filter(item => {
        if (item.source !== 'OCR') return true;
        if (!item.sourcePrescriptionId) return false; // Remove legacy OCR items
        if (item.sourcePrescriptionId.toString() === prescription._id.toString()) return false; // Remove this prescription's OCR items
        return true; // Keep other prescriptions' OCR items
      });

      for (const entry of prescription.extractedMedicines) {
        if (entry.matchedMedicineId) {
          const med = await Medicine.findById(entry.matchedMedicineId);
          if (med) {
            request.items.push({
              medicineId: med._id,
              medicineSnapshot: {
                name: med.name,
                brand: med.brand,
                dosage: med.dosage,
                category: med.category,
                manufacturer: med.manufacturer
              },
              quantity: entry.quantity || 1,
              unit: entry.unit || 'UNIT',
              notes: entry.notes || '',
              prescriptionRequired: med.prescriptionRequired,
              source: 'OCR',
              sourcePrescriptionId: prescription._id
            });
          }
        }
      }

      // Also ensure the request knows about the prescription ID
      if (!request.prescriptionIds) {
        request.prescriptionIds = [];
      }
      if (!request.prescriptionIds.includes(prescription._id)) {
        request.prescriptionIds.push(prescription._id);
      }
      request.requiresPrescription = true;

      await request.save();
    }

    return prescription;
  }
}

module.exports = new PrescriptionService();
