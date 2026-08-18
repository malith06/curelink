const express = require('express');
const dashboardController = require('./dashboard.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { dashboardRangeSchema } = require('./dashboard.validation');
const { ROLES } = require('../users/user.constants');

const router = express.Router();

// Require authentication for all dashboard routes
router.use(protect);

// Customer Dashboard
router.get(
  '/customer',
  authorize(ROLES.CUSTOMER),
  dashboardController.getCustomerDashboard
);

// Pharmacy Dashboard
router.get(
  '/pharmacy',
  authorize(ROLES.PHARMACY),
  validate(dashboardRangeSchema),
  dashboardController.getPharmacyDashboard
);

// Admin Dashboard
router.get(
  '/admin',
  authorize(ROLES.ADMIN),
  validate(dashboardRangeSchema),
  dashboardController.getAdminDashboard
);

module.exports = router;
