const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const pharmacyController = require('./pharmacy.controller');
const { createPharmacyProfileSchema } = require('./pharmacy.validation');

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

module.exports = router;
