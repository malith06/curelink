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

/**
 * @desc    Select Cash on Delivery for an order
 * @route   POST /api/v1/orders/:orderId/payments/cod
 * @access  Private (Customer only)
 */
exports.selectCOD = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const customerId = req.user._id;

  const result = await paymentService.selectCOD(orderId, customerId);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Mark COD payment as collected
 * @route   POST /api/v1/pharmacy/orders/:orderId/payments/cod/collect
 * @access  Private (Pharmacy only)
 */
exports.collectCOD = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const pharmacyUserId = req.user._id;

  const result = await paymentService.collectCOD(orderId, pharmacyUserId);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get all payments for admin monitoring
 * @route   GET /api/v1/admin/payments
 * @access  Private (Admin only)
 */
exports.getAllPayments = asyncHandler(async (req, res, next) => {
  const payments = await paymentService.getAllPayments(req.query);

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});
