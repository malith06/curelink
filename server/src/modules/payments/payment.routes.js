const express = require('express');
const rawWebhookBody = require('../../middleware/rawWebhookBody');
// const paymentController = require('./payment.controller'); // Will be added later

const webhookRouter = express.Router();
const customerPaymentRouter = express.Router({ mergeParams: true });
const pharmacyPaymentRouter = express.Router({ mergeParams: true });

// Webhook must be parsed as raw body
// webhookRouter.post('/webhook', rawWebhookBody, paymentController.handleWebhook);

module.exports = {
  webhookRouter,
  customerPaymentRouter,
  pharmacyPaymentRouter
};
