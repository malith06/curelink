const ApiError = require('../../utils/ApiError');
const customerDashboardService = require('./customerDashboard.service');
const pharmacyDashboardService = require('./pharmacyDashboard.service');
const adminDashboardService = require('./adminDashboard.service');

/**
 * @desc    Get customer dashboard data
 * @route   GET /api/v1/dashboards/customer
 * @access  Private (Customer only)
 */
exports.getCustomerDashboard = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const data = await customerDashboardService.getCustomerDashboard(customerId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pharmacy dashboard data
 * @route   GET /api/v1/dashboards/pharmacy
 * @access  Private (Pharmacy only)
 */
exports.getPharmacyDashboard = async (req, res, next) => {
  try {
    const Pharmacy = require('../pharmacies/pharmacy.model');
    const pharmacy = await Pharmacy.findOne({ ownerUserId: req.user._id }).lean();
    
    if (!pharmacy) {
      return next(new ApiError('Pharmacy profile not found for this user', 404));
    }
    
    const pharmacyId = pharmacy._id;

    const rangeStr = req.query.range || '30d';
    const rangeDays = parseInt(rangeStr.replace('d', ''), 10) || 30;

    const data = await pharmacyDashboardService.getPharmacyDashboard(pharmacyId, rangeDays);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/v1/dashboards/admin
 * @access  Private (Admin only)
 */
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const rangeStr = req.query.range || '30d';
    const rangeDays = parseInt(rangeStr.replace('d', ''), 10) || 30;

    const data = await adminDashboardService.getAdminDashboard(rangeDays);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
