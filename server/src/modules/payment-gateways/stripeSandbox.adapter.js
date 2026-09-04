const Stripe = require('stripe');
const PaymentGatewayAdapter = require('./paymentGateway.adapter');
const { GATEWAY_EVENT } = require('../payments/payment.constants');
const env = require('../../config/env');

class StripeSandboxAdapter extends PaymentGatewayAdapter {
  constructor() {
    super();
    // Initialize Stripe only if the key exists to avoid crashing tests where Stripe isn't mocked
    this.stripe = env.PAYMENT_SECRET_KEY ? new Stripe(env.PAYMENT_SECRET_KEY, {
      apiVersion: '2023-10-16',
    }) : null;
    this.webhookSecret = env.PAYMENT_WEBHOOK_SECRET;
  }

  async createCheckoutSession(input) {
    if (!this.stripe) throw new Error('Stripe is not configured in this environment');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.orderId,
      metadata: input.metadata,
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amount, // Stripe expects the smallest unit (e.g., cents)
            product_data: {
              name: `CureLink Order #${input.metadata.orderNumber}`,
              description: `Payment for prescription order`
            },
          },
          quantity: 1,
        },
      ],
    }, {
      idempotencyKey: input.idempotencyKey
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  }

  async processRefund(paymentIntentId, amount) {
    if (!this.stripe) throw new Error('Stripe is not configured in this environment');
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      return refund;
    } catch (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  async verifyWebhookSignature(rawBody, signature, headers) {
    if (!this.stripe) throw new Error('Stripe is not configured in this environment');
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
      return event;
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  async parseWebhookEvent(event) {
    const eventId = event.id;
    let eventType;
    let gatewaySessionId = null;
    let gatewayPaymentReference = null;
    let metadata = {};

    switch (event.type) {
      case 'checkout.session.completed':
        eventType = GATEWAY_EVENT.PAYMENT_SUCCEEDED;
        gatewaySessionId = event.data.object.id;
        gatewayPaymentReference = event.data.object.payment_intent;
        metadata = event.data.object.metadata || {};
        break;
      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed':
        eventType = GATEWAY_EVENT.PAYMENT_FAILED;
        gatewaySessionId = event.data.object.id; // Could be payment_intent ID if not session
        metadata = event.data.object.metadata || {};
        break;
      case 'checkout.session.expired':
        eventType = GATEWAY_EVENT.CHECKOUT_CANCELLED;
        gatewaySessionId = event.data.object.id;
        metadata = event.data.object.metadata || {};
        break;
      default:
        eventType = 'UNMAPPED_EVENT';
        break;
    }

    return {
      eventId,
      eventType,
      gatewaySessionId,
      gatewayPaymentReference,
      metadata
    };
  }
}

module.exports = new StripeSandboxAdapter();
