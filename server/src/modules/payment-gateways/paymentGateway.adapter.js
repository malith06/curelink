/**
 * Base adapter class for payment gateways.
 * Specific gateway implementations (e.g. Stripe, PayHere) should extend this.
 */
class PaymentGatewayAdapter {
  /**
   * Creates a checkout session for the customer to pay.
   * @param {Object} input
   * @param {string} input.orderId
   * @param {number} input.amount
   * @param {string} input.currency
   * @param {string} input.successUrl
   * @param {string} input.cancelUrl
   * @param {string} input.idempotencyKey
   * @param {Object} input.metadata
   * @returns {Promise<{ sessionId: string, url: string }>}
   */
  async createCheckoutSession(input) {
    throw new Error('Method not implemented.');
  }

  /**
   * Verifies the webhook signature from the gateway.
   * @param {Buffer} rawBody
   * @param {string} signature
   * @param {Object} headers
   * @returns {Promise<Object>} The verified event payload
   */
  async verifyWebhookSignature(rawBody, signature, headers) {
    throw new Error('Method not implemented.');
  }

  /**
   * Parses the raw verified event payload into a normalized internal format.
   * @param {Object} event
   * @returns {Promise<{ eventId: string, eventType: string, gatewaySessionId: string, gatewayPaymentReference: string, metadata: Object }>}
   */
  async parseWebhookEvent(event) {
    throw new Error('Method not implemented.');
  }
}

module.exports = PaymentGatewayAdapter;
