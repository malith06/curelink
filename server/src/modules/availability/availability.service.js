const MedicineAvailability = require('./availability.model');
const Pharmacy = require('../pharmacies/pharmacy.model');
const Medicine = require('../medicines/medicine.model');
const ApiError = require('../../utils/ApiError');

const updateAvailability = async (userId, medicineId, updateData) => {
  // Find pharmacy by user ID
  const pharmacy = await Pharmacy.findOne({ ownerUserId: userId });
  if (!pharmacy) {
    throw new ApiError('Pharmacy profile not found', 404);
  }
  
  if (pharmacy.verificationStatus !== 'APPROVED') {
    throw new ApiError('Your pharmacy profile must be approved to manage inventory', 403);
  }

  // Ensure medicine exists and is active
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    throw new ApiError('Medicine not found in the catalogue', 404);
  }
  if (!medicine.isActive) {
    throw new ApiError('Cannot update availability for a deactivated medicine', 400);
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
    throw new ApiError('Pharmacy profile not found', 404);
  }

  const inventory = await MedicineAvailability.find({ pharmacyId: pharmacy._id })
    .populate('medicineId', 'name brand category manufacturer')
    .sort({ lastUpdated: -1 });

  return inventory;
};

module.exports = {
  updateAvailability,
  getPharmacyInventory,
};
