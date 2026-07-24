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

module.exports = {
  buildMedicineSnapshot
};
