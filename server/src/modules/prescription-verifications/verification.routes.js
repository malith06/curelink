const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const verificationController = require("./verification.controller");

const router = express.Router({ mergeParams: true });

// Require authentication for all verification routes
router.use(protect);

// Submit verification for a prescription
router.post("/", verificationController.submitVerification);

module.exports = router;
