const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { checkPrescriptionAccess } = require("../../middleware/prescriptionAccess.middleware");
const prescriptionController = require("./prescription.controller");

const router = express.Router();

// Require authentication for all prescription routes
router.use(protect);

// Enforce ownership and pharmacy access rules
router.use("/:prescriptionId", checkPrescriptionAccess);

router.get("/:prescriptionId/access", prescriptionController.getPrescriptionAccessUrl);

module.exports = router;
