const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const adminPharmacyController = require('./admin.pharmacy.controller');

const router = express.Router();

// All routes require ADMIN role
router.use(protect, authorize('ADMIN'));

router.get('/', adminPharmacyController.getPharmacies);
router.get('/:pharmacyId', adminPharmacyController.getPharmacyById);

module.exports = router;
