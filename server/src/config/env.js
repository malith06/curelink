const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is missing.`);
    process.exit(1);
  }
});

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 30,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'SANDBOX_GATEWAY',
  PAYMENT_SECRET_KEY: process.env.PAYMENT_SECRET_KEY,
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
  PAYMENT_SUCCESS_URL: process.env.PAYMENT_SUCCESS_URL || 'http://localhost:5173/customer/payments/success',
  PAYMENT_CANCEL_URL: process.env.PAYMENT_CANCEL_URL || 'http://localhost:5173/customer/payments/cancel',
  PAYMENT_MAX_ATTEMPTS_PER_ORDER: parseInt(process.env.PAYMENT_MAX_ATTEMPTS_PER_ORDER, 10) || 5,
  PAYMENT_RETRY_COOLDOWN_SECONDS: parseInt(process.env.PAYMENT_RETRY_COOLDOWN_SECONDS, 10) || 30,
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'LKR'
};
