const express = require('express');

/**
 * Middleware to capture the exact raw body for webhook verification.
 * Must be mounted on the specific webhook route BEFORE express.json() is applied.
 */
const rawWebhookBody = express.raw({ type: 'application/json' });

module.exports = rawWebhookBody;
