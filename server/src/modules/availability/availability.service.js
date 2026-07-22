const MedicineAvailability = require('./availability.model');
const Pharmacy = require('../pharmacies/pharmacy.model');
const Medicine = require('../medicines/medicine.model');
const ApiError = require('../../utils/ApiError');

const updateAvailability = async (userId, medicineId, updateData) => {
  // Find pharmacy by user ID
  const pharmacy = await Pharmacy.findOne({ ownerUserId: userId });
  if (!pharmacy) {
    throw new ApiError(404, 'Pharmacy profile not found');
  }
  
  if (pharmacy.verificationStatus !== 'APPROVED') {
    throw new ApiError(403, 'Your pharmacy profile must be approved to manage inventory');
  }

  // Ensure medicine exists and is active
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found in the catalogue');
  }
  if (!medicine.isActive) {
    throw new ApiError(400, 'Cannot update availability for a deactivated medicine');
  }

  // Update or create the availability record
  const availability = await MedicineAvailability.findOneAndUpdate(
    { pharmacyId: pharmacy._id, medicineId },
    {
      $set: {
        status: updateData.status,
        notes: updateData.notes || '',
        lastUpdated: Date.now(),
      },
    },
    { new: true, upsert: true }
  );

  return availability;
};

const getPharmacyInventory = async (userId) => {
  const pharmacy = await Pharmacy.findOne({ ownerUserId: userId });
  if (!pharmacy) {
    throw new ApiError(404, 'Pharmacy profile not found');
  }

  const inventory = await MedicineAvailability.find({ pharmacyId: pharmacy._id })
    .populate('medicineId', 'genericName brandName strength dosageForm category')
    .sort({ lastUpdated: -1 });

  return inventory;
};

module.exports = {
  updateAvailability,
  getPharmacyInventory,
};
