/**
 * Converts a standard decimal currency value (e.g., 10.50) to integer cents (1050).
 * Handles floating-point precision issues correctly by rounding to the nearest integer.
 * @param {number|string} amount
 * @returns {number|null} amount in cents, or null if invalid
 */
const toCents = (amount) => {
  if (amount === null || amount === undefined || amount === '') return null;
  const num = Number(amount);
  if (isNaN(num)) return null;
  return Math.round(num * 100);
};

/**
 * Converts integer cents (1050) to standard decimal currency value (10.50).
 * @param {number} cents
 * @returns {number|null} standard decimal amount, or null if invalid
 */
const fromCents = (cents) => {
  if (cents === null || cents === undefined || cents === '') return null;
  const num = Number(cents);
  if (isNaN(num)) return null;
  return Number((num / 100).toFixed(2));
};

/**
 * Calculates the subtotal for a quotation item in cents.
 * @param {number} availableQuantity (Integer)
 * @param {number} unitPriceInCents (Integer)
 * @returns {number} subtotal in cents
 */
const calculateItemSubtotal = (availableQuantity, unitPriceInCents) => {
  if (!availableQuantity || !unitPriceInCents) return 0;
  return availableQuantity * unitPriceInCents;
};

/**
 * Calculates the overall quotation total in cents.
 * @param {Array<{subtotal: number}>} items - Array of items with subtotal in cents
 * @param {number} deliveryFeeInCents (Integer)
 * @returns {number} total in cents
 */
const calculateQuotationTotal = (items, deliveryFeeInCents = 0) => {
  const itemsTotal = (items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0);
  return itemsTotal + (deliveryFeeInCents || 0);
};

module.exports = {
  toCents,
  fromCents,
  calculateItemSubtotal,
  calculateQuotationTotal
};
