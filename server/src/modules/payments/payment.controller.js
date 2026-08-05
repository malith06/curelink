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

/**
 * @desc    Handle Stripe Webhooks
 * @route   POST /api/v1/payments/webhook
 * @access  Public (Webhook)
 */
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const rawBody = req.body;
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).send('Missing stripe-signature header');
  }

  const result = await paymentService.handleWebhookEvent(rawBody, signature);

  res.status(200).json(result);
});
