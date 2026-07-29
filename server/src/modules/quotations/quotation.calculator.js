const { AVAILABILITY_RESULT } = require('./quotation.constants');

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

/**
 * Derives the availability result based on requested vs available quantities.
 * @param {number} requestedQuantity
 * @param {number} availableQuantity
 * @returns {string} AVAILABILITY_RESULT
 */
const calculateItemAvailability = (requestedQuantity, availableQuantity) => {
  if (!availableQuantity || availableQuantity <= 0) {
    return AVAILABILITY_RESULT.UNAVAILABLE;
  }
  if (availableQuantity >= requestedQuantity) {
    return AVAILABILITY_RESULT.FULLY_AVAILABLE;
  }
  return AVAILABILITY_RESULT.PARTIALLY_AVAILABLE;
};

/**
 * Calculates completeness metrics for the quotation.
 * @param {Array<{requestedQuantity: number, availableQuantity: number}>} items
 * @returns {Object} completeness metrics
 */
const calculateQuotationCompleteness = (items) => {
  if (!items || items.length === 0) {
    return {
      totalRequested: 0,
      totalAvailable: 0,
      coveragePercentage: 0,
      isCompleteFulfilment: false
    };
  }

  let totalRequested = 0;
  let totalAvailable = 0;
  let fullyAvailableCount = 0;
  let partiallyAvailableCount = 0;
  let unavailableCount = 0;

  items.forEach(item => {
    const req = item.requestedQuantity || 0;
    const avail = item.availableQuantity || 0;
    
    totalRequested += req;
    // Cap available at requested for percentage calculation
    totalAvailable += Math.min(avail, req);

    const result = calculateItemAvailability(req, avail);
    if (result === AVAILABILITY_RESULT.FULLY_AVAILABLE) fullyAvailableCount++;
    else if (result === AVAILABILITY_RESULT.PARTIALLY_AVAILABLE) partiallyAvailableCount++;
    else unavailableCount++;
  });

  const coveragePercentage = totalRequested > 0 
    ? Math.round((totalAvailable / totalRequested) * 100) 
    : 0;

  const isCompleteFulfilment = (unavailableCount === 0 && partiallyAvailableCount === 0);

  return {
    totalRequested,
    totalAvailable,
    coveragePercentage,
    fullyAvailableCount,
    partiallyAvailableCount,
    unavailableCount,
    isCompleteFulfilment
  };
};

module.exports = {
  toCents,
  fromCents,
  calculateItemSubtotal,
  calculateQuotationTotal,
  calculateItemAvailability,
  calculateQuotationCompleteness
};
