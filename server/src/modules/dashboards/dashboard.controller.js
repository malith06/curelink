const asyncHandler = require('../../middleware/async.middleware');
const ErrorResponse = require('../../utils/errorResponse');
const customerDashboardService = require('./customerDashboard.service');
const pharmacyDashboardService = require('./pharmacyDashboard.service');
const adminDashboardService = require('./adminDashboard.service');

/**
 * @desc    Get customer dashboard data
 * @route   GET /api/v1/dashboards/customer
 * @access  Private (Customer only)
 */
exports.getCustomerDashboard = asyncHandler(async (req, res, next) => {
  const customerId = req.user.id;

  const data = await customerDashboardService.getCustomerDashboard(customerId);

  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * @desc    Get pharmacy dashboard data
 * @route   GET /api/v1/dashboards/pharmacy
 * @access  Private (Pharmacy only)
 */
exports.getPharmacyDashboard = asyncHandler(async (req, res, next) => {
  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId) {
    return next(new ErrorResponse('Pharmacy profile not found for this user', 404));
  }

  const rangeStr = req.query.range || '30d';
  const rangeDays = parseInt(rangeStr.replace('d', ''), 10) || 30;

  const data = await pharmacyDashboardService.getPharmacyDashboard(pharmacyId, rangeDays);

  res.status(200).json({ success: true, data });
});

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/v1/dashboards/admin
 * @access  Private (Admin only)
 */
exports.getAdminDashboard = asyncHandler(async (req, res, next) => {
  const rangeStr = req.query.range || '30d';
  const rangeDays = parseInt(rangeStr.replace('d', ''), 10) || 30;

  const data = await adminDashboardService.getAdminDashboard(rangeDays);

  res.status(200).json({ success: true, data });
});
