const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const prescriptionController = require("./prescription.controller");

const router = express.Router();

// Require authentication for all prescription routes
router.use(protect);

// Will add ownership middleware here in subsequent units
// e.g., router.use('/:prescriptionId/access', checkPrescriptionAccess);

router.get("/:prescriptionId/access", prescriptionController.getPrescriptionAccessUrl);

module.exports = router;
