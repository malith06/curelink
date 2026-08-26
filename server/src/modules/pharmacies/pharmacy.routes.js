const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate');
const pharmacyController = require('./pharmacy.controller');
const { createPharmacyProfileSchema, updatePharmacyProfileSchema } = require('./pharmacy.validation');
const { provideQuotationSchema, updateRequestStatusSchema } = require('../requests/request.validation');
const imageUpload = require('../../middleware/imageUpload');

const router = express.Router();

// Public routes
router.get('/', pharmacyController.getVerifiedPharmacies);
router.get('/nearby', pharmacyController.findNearbyPharmacies);

// Protected routes
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
  '/me/photo',
  protect,
  authorize('PHARMACY'),
  imageUpload,
  pharmacyController.uploadPharmacyPhoto
);

router.post(
  '/me/submit-verification',
  protect,
  authorize('PHARMACY'),
  pharmacyController.submitForVerification
);

router.patch(
  '/me/location',
  protect,
  authorize('PHARMACY'),
  // Add validation if needed, assuming validation is in controller for now or using locationSchema
  pharmacyController.updatePharmacyLocation
);

router.get(
  '/me/requests',
  protect,
  authorize('PHARMACY'),
  pharmacyController.getPharmacyInboxRequests
);

router.get(
  '/me/requests/:requestId',
  protect,
  authorize('PHARMACY'),
  pharmacyController.getPharmacyRequestDetails
);

router.post(
  '/me/requests/:requestId/quote',
  protect,
  authorize('PHARMACY'),
  validate(provideQuotationSchema),
  pharmacyController.provideQuotation
);

router.patch(
  '/me/requests/:requestId/status',
  protect,
  authorize('PHARMACY'),
  validate(updateRequestStatusSchema),
  pharmacyController.updateRequestStatus
);

module.exports = router;
