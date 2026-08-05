const express = require('express');
const rawWebhookBody = require('../../middleware/rawWebhookBody');
const paymentController = require('./payment.controller');

const webhookRouter = express.Router();
const customerPaymentRouter = express.Router({ mergeParams: true });
const pharmacyPaymentRouter = express.Router({ mergeParams: true });

// Customer routes (Mounted at /api/v1/orders/:orderId/payments)
customerPaymentRouter.post('/card/session', paymentController.createCardSession);

// Webhook must be parsed as raw body
webhookRouter.post('/webhook', rawWebhookBody, paymentController.handleWebhook);

module.exports = {
  webhookRouter,
  customerPaymentRouter,
  pharmacyPaymentRouter
};
