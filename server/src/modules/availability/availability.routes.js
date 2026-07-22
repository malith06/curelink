const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../users/user.constants');
const { updateAvailabilitySchema } = require('./availability.validation');
const availabilityController = require('./availability.controller');

const router = express.Router();

// All availability routes require authentication and PHARMACY role
router.use(protect);
router.use(authorize(ROLES.PHARMACY));

// Get pharmacy's full inventory
router.get('/inventory', availabilityController.getPharmacyInventory);

// Update a specific medicine's availability status
router.put(
  '/:medicineId',
  validate(updateAvailabilitySchema),
  availabilityController.updateAvailability
);

module.exports = router;
