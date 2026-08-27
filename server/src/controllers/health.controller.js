const asyncHandler = require('../utils/asyncHandler');
const User = require('../modules/users/user.model');
const Pharmacy = require('../modules/pharmacies/pharmacy.model');
const Request = require('../modules/requests/request.model');

/**
 * @desc    Check API Health
 * @route   GET /api/v1/health
 * @access  Public
 */
exports.checkHealth = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'CureLink API is running perfectly',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get Platform Statistics for Homepage
 * @route   GET /api/v1/health/stats
 * @access  Public
 */
exports.getPlatformStats = asyncHandler(async (req, res, next) => {
  const verifiedPharmaciesCount = await Pharmacy.countDocuments({ verificationStatus: 'APPROVED' });
  const registeredPatientsCount = await User.countDocuments({ role: 'CUSTOMER' });
  const prescriptionsProcessedCount = await Request.countDocuments();
  
  const distinctCities = await Pharmacy.distinct('address.city', { verificationStatus: 'APPROVED' });
  const citiesCoveredCount = distinctCities.length;

  res.status(200).json({
    success: true,
    data: {
      verifiedPharmacies: verifiedPharmaciesCount,
      registeredPatients: registeredPatientsCount,
      prescriptionsProcessed: prescriptionsProcessedCount,
      citiesCovered: citiesCoveredCount
    }
  });
});
