# Prescription OCR Workflow

This document outlines the API workflow for the AI-driven Prescription OCR extraction and Pharmacist Verification in the CureLink system.

## 1. Customer Uploads Prescription
**Endpoint**: `POST /api/v1/requests/:requestId/prescription`
- **Actor**: Customer
- **Payload**: `multipart/form-data` with `prescription` field (PDF, JPG, PNG).
- **Action**: Uploads the file securely to Cloudinary, creates a `Prescription` document, links it to the `MedicineRequest`.
- **Response**: `Prescription` object with `uploadStatus: 'COMPLETED'` and `ocrStatus: 'PENDING'`.

## 2. Trigger OCR Processing
**Endpoint**: `POST /api/v1/prescriptions/:prescriptionId/process-ocr`
- **Actor**: Customer (via frontend automatically after upload)
- **Action**: Determines the right adapter (Tesseract for Images, PDF adapter for PDFs). Extracts raw text, normalises it, matches it against the MongoDB `Medicine` collection using string-similarity.
- **Response**: Updates `prescription.extractedMedicines` and sets `ocrStatus: 'COMPLETED'` (or `MANUAL_ENTRY_REQUIRED` if it fails completely).

## 3. Customer Reviews Results
**Endpoint**: `GET /api/v1/prescriptions/:prescriptionId/ocr`
- **Actor**: Customer
- **Action**: Fetches the current state of OCR, populating `matchedMedicineId` fields for display.
- **Response**: `ocrStatus`, `rawExtractedText`, `extractedMedicines` array containing confidence scores and names.

## 4. Customer Submits Corrections
**Endpoint**: `PUT /api/v1/prescriptions/:prescriptionId/ocr`
- **Actor**: Customer
- **Payload**: `{ entries: [{ medicineId, extractedText, quantity, entryId }] }`
- **Action**: Updates the `extractedMedicines` array. Flags manually added ones with `customerAction: 'MANUALLY_ADDED'` and others as `CORRECTED`.

## 5. Customer Confirms Prescription
**Endpoint**: `POST /api/v1/prescriptions/:prescriptionId/confirm`
- **Actor**: Customer
- **Action**: Sets `customerReviewStatus: 'CONFIRMED'`. Loops through all extracted/corrected medicines and syncs them to the parent `MedicineRequest.items` with `source: 'OCR'`.

## 6. Pharmacy Retrieves Secure URL
**Endpoint**: `GET /api/v1/prescriptions/:prescriptionId/access`
- **Actor**: Pharmacy
- **Action**: Generates a short-lived (15 min) signed URL to view the prescription from Cloudinary safely.
- **Response**: `{ url: 'https://...' }`

## 7. Pharmacist Manual Verification
**Endpoint**: `POST /api/v1/prescriptions/:prescriptionId/verify`
- **Actor**: Pharmacy
- **Payload**: 
  ```json
  {
    "verificationStatus": "APPROVED",
    "verifiedMedicines": [
      { "medicineId": "...", "isVerified": true, "pharmacistNotes": "..." }
    ],
    "generalNotes": "..."
  }
  ```
- **Action**: Creates or updates a `PrescriptionVerification` document tying the `pharmacyId`, `prescriptionId`, and the exact verified medicines together for legal compliance.
