const express = require('express');
const rawWebhookBody = require('../../middleware/rawWebhookBody');
const paymentController = require('./payment.controller');

const webhookRouter = express.Router();
const customerPaymentRouter = express.Router({ mergeParams: true });
const pharmacyPaymentRouter = express.Router({ mergeParams: true });

// Customer routes (Mounted at /api/v1/orders/:orderId/payments)
customerPaymentRouter.post('/card/session', paymentController.createCardSession);
customerPaymentRouter.post('/cod', paymentController.selectCOD);

// Pharmacy routes (Mounted at /api/v1/pharmacy/orders/:orderId/payments)
pharmacyPaymentRouter.post('/cod/collect', paymentController.collectCOD);

// Webhook must be parsed as raw body
webhookRouter.post('/webhook', rawWebhookBody, paymentController.handleWebhook);

const { protect, authorize } = require('../../middleware/auth.middleware');

// Admin routes (Mounted at /api/v1/admin/payments)
const adminPaymentRouter = express.Router();
adminPaymentRouter.use(protect, authorize('ADMIN'));
adminPaymentRouter.get('/', paymentController.getAllPayments);

module.exports = {
  webhookRouter,
  customerPaymentRouter,
  pharmacyPaymentRouter,
  adminPaymentRouter
};
