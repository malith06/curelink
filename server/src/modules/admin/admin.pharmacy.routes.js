const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const adminPharmacyController = require('./admin.pharmacy.controller');

const router = express.Router();

// All routes require ADMIN role
router.use(protect, authorize('ADMIN'));

router.get('/', adminPharmacyController.getPharmacies);
router.get('/:pharmacyId', adminPharmacyController.getPharmacyById);
router.patch('/:pharmacyId/approve', adminPharmacyController.approvePharmacy);
router.patch('/:pharmacyId/reject', adminPharmacyController.rejectPharmacy);

module.exports = router;
