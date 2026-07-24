const MedicineRequest = require('./request.model');
const Medicine = require('../medicines/medicine.model');
const { REQUEST_STATUS } = require('./request.constants');
const ApiError = require('../../utils/ApiError');

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

/**
 * Adds a medicine item to an existing draft request.
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer (for ownership check)
 * @param {Object} itemData - The item data to add
 * @returns {Promise<Object>} The updated request
 */
const addItemToRequest = async (requestId, customerId, itemData) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  if (!request) {
    throw new ApiError(404, 'Request not found or unauthorized');
  }
  if (request.status !== REQUEST_STATUS.DRAFT) {
    throw new ApiError(400, 'Cannot modify a non-draft request');
  }

  const medicine = await Medicine.findById(itemData.medicineId);
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found');
  }

  const existingItemIndex = request.items.findIndex(
    item => item.medicineId.toString() === itemData.medicineId.toString()
  );

  if (existingItemIndex > -1) {
    // Merge quantity for duplicate medicines
    request.items[existingItemIndex].quantity += itemData.quantity || 1;
    if (itemData.notes) {
      request.items[existingItemIndex].notes = itemData.notes;
    }
  } else {
    // Add new item
    const snapshot = buildMedicineSnapshot(medicine);
    request.items.push({
      ...itemData,
      medicineSnapshot: snapshot,
      requiresPrescription: medicine.requiresPrescription
    });
  }

  request.requiresPrescription = calculatePrescriptionRequirement(request.items);
  await request.save();
  
  return request;
};

module.exports = {
  buildMedicineSnapshot,
  calculatePrescriptionRequirement,
  createDraftRequest,
  addItemToRequest
};
