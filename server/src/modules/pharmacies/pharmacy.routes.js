const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate');
const pharmacyController = require('./pharmacy.controller');
const { createPharmacyProfileSchema, updatePharmacyProfileSchema } = require('./pharmacy.validation');

const router = express.Router();

router.post(
  '/me/profile',
  protect,
  authorize('PHARMACY'),
  validate(createPharmacyProfileSchema),
  pharmacyController.createPharmacyProfile
);

router.get(
  '/me/profile',
  protect,
  authorize('PHARMACY'),
  pharmacyController.getMyPharmacyProfile
);

router.patch(
  '/me/profile',
  protect,
  authorize('PHARMACY'),
  validate(updatePharmacyProfileSchema),
  pharmacyController.updatePharmacyProfile
);

router.post(
  '/me/submit-verification',
  protect,
  authorize('PHARMACY'),
  pharmacyController.submitForVerification
);

module.exports = router;
