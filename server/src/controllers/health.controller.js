const asyncHandler = require('../utils/asyncHandler');

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
