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

  // Construct update object dynamically to only update provided fields,
  // but always update lastUpdated.
  const updateSet = {
    notes: updateData.notes !== undefined ? updateData.notes : '',
    lastUpdated: Date.now(),
  };

  if (updateData.status !== undefined) updateSet.status = updateData.status;
  if (updateData.price !== undefined) updateSet.price = updateData.price;
  if (updateData.stockQuantity !== undefined) updateSet.stockQuantity = updateData.stockQuantity;
  if (updateData.dosage !== undefined) updateSet.dosage = updateData.dosage;
  if (updateData.isManualOverride !== undefined) updateSet.isManualOverride = updateData.isManualOverride;

  // Update or create the availability record
  const availability = await MedicineAvailability.findOneAndUpdate(
    { pharmacyId: pharmacy._id, medicineId },
    { $set: updateSet },
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

const deleteAvailability = async (userId, recordId) => {
  const pharmacy = await Pharmacy.findOne({ ownerUserId: userId });
  if (!pharmacy) {
    throw new ApiError('Pharmacy profile not found', 404);
  }

  const result = await MedicineAvailability.findOneAndDelete({
    _id: recordId,
    pharmacyId: pharmacy._id
  });

  if (!result) {
    throw new ApiError('Availability record not found', 404);
  }

  return true;
};

const deductStockForOrder = async (order, session) => {
  for (const item of order.items) {
    // Determine the actual medicine dispensed (substitute if accepted)
    const activeMedicineId = item.substitutionOffered && item.substitutionMedicineId 
      ? item.substitutionMedicineId 
      : item.medicineId;

    if (!activeMedicineId) continue;

    const availability = await MedicineAvailability.findOne({
      pharmacyId: order.pharmacyId,
      medicineId: activeMedicineId
    }).session(session);

    // Only auto-deduct if the pharmacy uses stock quantity tracking
    if (availability && availability.stockQuantity !== null && availability.stockQuantity !== undefined) {
      availability.stockQuantity = Math.max(0, availability.stockQuantity - item.approvedQuantity);
      availability.lastUpdated = Date.now();
      await availability.save({ session });
    }
  }
};

const restockForOrder = async (order, session) => {
  for (const item of order.items) {
    const activeMedicineId = item.substitutionOffered && item.substitutionMedicineId 
      ? item.substitutionMedicineId 
      : item.medicineId;

    if (!activeMedicineId) continue;

    const availability = await MedicineAvailability.findOne({
      pharmacyId: order.pharmacyId,
      medicineId: activeMedicineId
    }).session(session);

    if (availability && availability.stockQuantity !== null && availability.stockQuantity !== undefined) {
      availability.stockQuantity += item.approvedQuantity;
      availability.lastUpdated = Date.now();
      await availability.save({ session });
    }
  }
};

module.exports = {
  updateAvailability,
  getPharmacyInventory,
  deleteAvailability,
  deductStockForOrder,
  restockForOrder,
};
