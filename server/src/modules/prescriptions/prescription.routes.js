const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { checkPrescriptionAccess } = require("../../middleware/prescriptionAccess.middleware");
const prescriptionController = require("./prescription.controller");
const verificationRoutes = require("../prescription-verifications/verification.routes");

const router = express.Router();

// Require authentication for all prescription routes
router.use(protect);

// Enforce ownership and pharmacy access rules
router.use("/:prescriptionId", checkPrescriptionAccess);

router.get("/:prescriptionId/access", prescriptionController.getPrescriptionAccessUrl);
router.post("/:prescriptionId/process-ocr", prescriptionController.processOcr);
router.get("/:prescriptionId/ocr", prescriptionController.getOcrResults);
router.put("/:prescriptionId/ocr", prescriptionController.updateOcrEntries);
router.post("/:prescriptionId/confirm", prescriptionController.confirmPrescription);

// Mount verification routes
router.use("/:prescriptionId/verify", verificationRoutes);

module.exports = router;
