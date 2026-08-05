const paymentService = require('./payment.service');
const asyncHandler = require('../../middleware/async.middleware');

/**
 * @desc    Initialize a card checkout session
 * @route   POST /api/v1/orders/:orderId/payments/card/session
 * @access  Private (Customer only)
 */
exports.createCardSession = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const customerId = req.user._id;

  const sessionData = await paymentService.createCardCheckoutSession(orderId, customerId);

  res.status(201).json({
    success: true,
    data: sessionData
  });
});
