const Pharmacy = require('./pharmacy.model');
const MedicineAvailability = require('../availability/availability.model');
const Medicine = require('../medicines/medicine.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { PHARMACY_VERIFICATION_STATUS } = require('./pharmacy.constants');
const { createAndEmitNotification } = require('../notifications/notification.service');
const { NOTIFICATION_EVENTS, NOTIFICATION_ENTITY_TYPES } = require('../notifications/notification.constants');

const createPharmacyProfile = async (userId, profileData) => {
  const existingProfile = await Pharmacy.findOne({ ownerUserId: userId });
  if (existingProfile) {
    throw new ApiError('Pharmacy profile already exists for this user', 400);
  }

  // Auto-generate sequential registration number (e.g. REG-0001)
  const lastPharmacy = await Pharmacy.findOne({}, { registrationNumber: 1 })
    .sort({ createdAt: -1 })
    .lean();
    
  let nextNum = 1;
  if (lastPharmacy && lastPharmacy.registrationNumber && lastPharmacy.registrationNumber.startsWith('REG-')) {
    const parts = lastPharmacy.registrationNumber.split('-');
    if (parts.length > 1) {
      const numStr = parts[1];
      if (!isNaN(numStr)) {
        nextNum = parseInt(numStr, 10) + 1;
      }
    }
  }
  
  const generatedRegistrationNumber = `REG-${nextNum.toString().padStart(4, '0')}`;
  profileData.registrationNumber = generatedRegistrationNumber;

  const profile = await Pharmacy.create({
    ...profileData,
    ownerUserId: userId,
  });

  return profile;
};

const getPharmacyProfileByUserId = async (userId) => {
  const profile = await Pharmacy.findOne({ ownerUserId: userId });
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }
  return profile;
};

const updatePharmacyProfile = async (userId, updateData) => {
  const profile = await Pharmacy.findOne({ ownerUserId: userId });
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }

  if (
    profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.APPROVED ||
    profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.SUSPENDED ||
    profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.PENDING
  ) {
    const allowedFields = ['name', 'address', 'phone', 'email', 'openingHours', 'deliveryAvailable', 'pickupAvailable', 'photoUrl', 'serviceRadiusKm', 'location'];
    const keys = Object.keys(updateData);
    const hasDisallowed = keys.some((key) => !allowedFields.includes(key));
    if (hasDisallowed) {
      const disallowedKeys = keys.filter((key) => !allowedFields.includes(key));
      throw new ApiError(`Cannot update critical fields: ${disallowedKeys.join(', ')}. Please contact support.`, 400);
    }
  }



  Object.assign(profile, updateData);
  await profile.save();
  return profile;
};

const submitForVerification = async (userId) => {
  const profile = await Pharmacy.findOne({ ownerUserId: userId });
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }

  if (
    profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.DRAFT &&
    profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.REJECTED
  ) {
    throw new ApiError('Profile cannot be submitted for verification from current status', 400);
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.PENDING;
  profile.verificationNote = ''; // Clear previous rejection notes
  await profile.save();

  try {
    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
      await createAndEmitNotification({
        type: NOTIFICATION_EVENTS.PHARMACY_SUBMITTED,
        recipient: admin,
        entity: profile
      });
    }
  } catch (error) {
    console.error('Failed to send admin notifications for pharmacy submission:', error);
  }

  return profile;
};

const updatePharmacyLocation = async (userId, latitude, longitude) => {
  const profile = await Pharmacy.findOne({ ownerUserId: userId });
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }

  // Validate coordinates manually just in case
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new ApiError('Invalid coordinate ranges', 400);
  }

  profile.location = {
    type: 'Point',
    coordinates: [longitude, latitude], // GeoJSON order
  };
  profile.locationUpdatedAt = new Date();

  await profile.save();
  return profile;
};

// --- ADMIN SERVICES ---

const getPharmacies = async (filters, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const query = {};
  if (filters.status) query.verificationStatus = filters.status;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { registrationNumber: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const items = await Pharmacy.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = await Pharmacy.countDocuments(query);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPharmacyById = async (pharmacyId) => {
  const profile = await Pharmacy.findById(pharmacyId).populate('ownerUserId', 'name email role');
  if (!profile) {
    throw new ApiError('Pharmacy not found', 404);
  }
  return profile;
};

const approvePharmacy = async (pharmacyId, adminId) => {
  const profile = await Pharmacy.findById(pharmacyId).populate('ownerUserId', 'role');
  if (!profile) {
    throw new ApiError('Pharmacy not found', 404);
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.PENDING && profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.DRAFT) {
    throw new ApiError('Can only approve pharmacies that are in PENDING or DRAFT status', 400);
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.APPROVED;
  profile.verificationNote = '';
  profile.verifiedBy = adminId;
  profile.verifiedAt = new Date();
  
  await profile.save();

  try {
    await createAndEmitNotification({
      type: NOTIFICATION_EVENTS.PHARMACY_APPROVED,
      recipient: profile.ownerUserId,
      entity: profile
    });
  } catch (error) {
    console.error('Failed to send notification for pharmacy approval:', error);
  }

  return profile;
};

const rejectPharmacy = async (pharmacyId, reason, adminId) => {
  if (!reason || reason.trim() === '') {
    throw new ApiError('Rejection reason is required', 400);
  }

  const profile = await Pharmacy.findById(pharmacyId).populate('ownerUserId', 'role');
  if (!profile) {
    throw new ApiError('Pharmacy not found', 404);
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.PENDING && profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.DRAFT) {
    throw new ApiError('Can only reject pharmacies that are in PENDING or DRAFT status', 400);
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.REJECTED;
  profile.verificationNote = reason;
  profile.verifiedBy = adminId;
  profile.verifiedAt = new Date();
  
  await profile.save();

  try {
    await createAndEmitNotification({
      type: NOTIFICATION_EVENTS.PHARMACY_REJECTED,
      recipient: profile.ownerUserId,
      entity: profile,
      context: { reason }
    });
  } catch (error) {
    console.error('Failed to send notification for pharmacy rejection:', error);
  }

  return profile;
};

const suspendPharmacy = async (pharmacyId, reason, adminId) => {
  if (!reason || reason.trim() === '') {
    throw new ApiError('Suspension reason is required', 400);
  }

  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError('Pharmacy not found', 404);
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.APPROVED) {
    throw new ApiError('Can only suspend pharmacies that are currently APPROVED', 400);
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.SUSPENDED;
  profile.verificationNote = reason;
  
  await profile.save();
  return profile;
};

const reactivatePharmacy = async (pharmacyId, adminId) => {
  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError('Pharmacy not found', 404);
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.SUSPENDED) {
    throw new ApiError('Can only reactivate pharmacies that are currently SUSPENDED', 400);
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.APPROVED;
  profile.verificationNote = ''; // Clear suspension reason
  
  await profile.save();
  return profile;
};

// --- PUBLIC SERVICES ---

const findNearbyPharmacies = async (lng, lat, radiusKm = 10, medicineIds = null) => {
  const radiusInRadians = radiusKm / 6378.1; // Earth's equatorial radius in km

  const query = {
    verificationStatus: PHARMACY_VERIFICATION_STATUS.APPROVED,
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians]
      }
    }
  };

  // If we only need pharmacies near a location
  if (!medicineIds || (Array.isArray(medicineIds) && medicineIds.length === 0)) {
    return await Pharmacy.find(query).select('-ownerUserId -verificationNote -verifiedBy -verifiedAt').lean();
  }

  // Ensure medicineIds is an array
  const idsToSearch = Array.isArray(medicineIds) ? medicineIds : [medicineIds];

  // If we need to filter by medicine availability, we find available pharmacies first
  const availabilityRecords = await MedicineAvailability.find({
    medicineId: { $in: idsToSearch },
    status: { $in: ['AVAILABLE', 'LIMITED', 'CONFIRMATION_REQUIRED'] }
  }).select('pharmacyId medicineId status lastUpdated');

  // Fetch medicine names/dosages for display labels
  const medicineDetails = await Medicine.find({ _id: { $in: idsToSearch } })
    .select('name dosage')
    .lean();
  const medicineMap = {};
  medicineDetails.forEach(med => {
    medicineMap[med._id.toString()] = med.dosage ? `${med.name} (${med.dosage})` : med.name;
  });

  // Count how many of the requested medicines each pharmacy has
  const pharmacyCounts = {};
  availabilityRecords.forEach(record => {
    const pIdStr = record.pharmacyId.toString();
    if (!pharmacyCounts[pIdStr]) {
      pharmacyCounts[pIdStr] = new Set();
    }
    pharmacyCounts[pIdStr].add(record.medicineId.toString());
  });

  // Build a per-pharmacy lookup: pharmacyId -> { medicineId -> status }
  const pharmacyMedicineStatus = {};
  availabilityRecords.forEach(record => {
    const pIdStr = record.pharmacyId.toString();
    const mIdStr = record.medicineId.toString();
    if (!pharmacyMedicineStatus[pIdStr]) {
      pharmacyMedicineStatus[pIdStr] = {};
    }
    pharmacyMedicineStatus[pIdStr][mIdStr] = record.status;
  });

  let nearbyPharmacies = await Pharmacy.find(query).select('-ownerUserId -verificationNote -verifiedBy -verifiedAt').lean();

  // Attach availability status to each pharmacy
  nearbyPharmacies = nearbyPharmacies.map(pharmacy => {
    const pIdStr = pharmacy._id.toString();
    const availableCount = pharmacyCounts[pIdStr] ? pharmacyCounts[pIdStr].size : 0;
    
    let status = 'UNKNOWN';
    if (availableCount === idsToSearch.length && idsToSearch.length > 0) {
        status = 'AVAILABLE';
    } else if (availableCount > 0) {
        status = 'LIMITED'; // Partially available
    } else {
        status = 'UNAVAILABLE';
    }

    // Build per-medicine status list
    const medicineStatuses = idsToSearch.map(mId => {
      const mIdStr = mId.toString();
      const medStatus = pharmacyMedicineStatus[pIdStr]?.[mIdStr] || 'UNAVAILABLE';
      return {
        medicineId: mIdStr,
        name: medicineMap[mIdStr] || mIdStr,
        status: medStatus,
      };
    });
    
    return {
      ...pharmacy,
      availabilityStatus: status,
      availableMedicinesCount: availableCount,
      medicineStatuses,
    };
  });

  // Filter out pharmacies that don't have ANY of the requested medicines
  nearbyPharmacies = nearbyPharmacies.filter(p => p.availableMedicinesCount > 0);

  return nearbyPharmacies;
};

const updatePharmacyPhotoUrl = async (userId, photoUrl) => {
  const profile = await Pharmacy.findOneAndUpdate(
    { ownerUserId: userId },
    { $set: { photoUrl } },
    { new: true, runValidators: true }
  );
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }
  return profile;
};

const getVerifiedPharmacies = async () => {
  return Pharmacy.find({ verificationStatus: PHARMACY_VERIFICATION_STATUS.APPROVED })
    .select('name location address photoUrl deliveryAvailable pickupAvailable')
    .sort({ name: 1 })
    .lean();
};

module.exports = {
  createPharmacyProfile,
  getPharmacyProfileByUserId,
  updatePharmacyProfile,
  submitForVerification,
  updatePharmacyLocation,
  getPharmacies,
  getPharmacyById,
  approvePharmacy,
  rejectPharmacy,
  suspendPharmacy,
  reactivatePharmacy,
  findNearbyPharmacies,
  updatePharmacyPhotoUrl,
  getVerifiedPharmacies,
};
