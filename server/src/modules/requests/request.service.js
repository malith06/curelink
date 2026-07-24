const MedicineRequest = require('./request.model');
const Medicine = require('../medicines/medicine.model');
const { REQUEST_STATUS } = require('./request.constants');

/**
 * Builds a snapshot of a medicine's current state to be embedded in a request item.
 * @param {Object} medicine - The Medicine Mongoose document
 * @returns {Object} The snapshot object
 */
const buildMedicineSnapshot = (medicine) => {
  return {
    genericName: medicine.genericName,
    brandName: medicine.brandName,
    strength: medicine.strength,
    dosageForm: medicine.dosageForm
  };
};

/**
 * Calculates whether a request requires a prescription based on its items.
 * @param {Array} items - Array of request items
 * @returns {Boolean} True if any item requires a prescription
 */
const calculatePrescriptionRequirement = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return false;
  return items.some(item => item.requiresPrescription === true);
};

/**
 * Creates a new draft medicine request for a customer.
 * @param {String} customerId - The ID of the customer
 * @returns {Promise<Object>} The newly created draft request
 */
const createDraftRequest = async (customerId) => {
  const request = new MedicineRequest({
    customerId,
    items: [],
    status: REQUEST_STATUS.DRAFT
  });
  
  await request.save();
  return request;
};

module.exports = {
  buildMedicineSnapshot,
  calculatePrescriptionRequirement,
  createDraftRequest
};
