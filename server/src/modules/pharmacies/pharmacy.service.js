const Pharmacy = require('./pharmacy.model');
const MedicineAvailability = require('../availability/availability.model');
const ApiError = require('../../utils/ApiError');
const { PHARMACY_VERIFICATION_STATUS } = require('./pharmacy.constants');

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

  if (profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.PENDING) {
    throw new ApiError('Cannot edit profile while verification is pending', 400);
  }

  if (
    profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.APPROVED ||
    profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.SUSPENDED
  ) {
    const allowedFields = ['phone', 'openingHours', 'deliveryAvailable', 'pickupAvailable'];
    const keys = Object.keys(updateData);
    const hasDisallowed = keys.some((key) => !allowedFields.includes(key));
    if (hasDisallowed) {
      throw new ApiError('Cannot update critical fields after approval. Please contact support.', 400);
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
  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError('Pharmacy not found', 404);
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.PENDING) {
    throw new ApiError('Can only approve pharmacies that are in PENDING status', 400);
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.APPROVED;
  profile.verificationNote = '';
  profile.verifiedBy = adminId;
  profile.verifiedAt = new Date();
  
  await profile.save();
  return profile;
};

const rejectPharmacy = async (pharmacyId, reason, adminId) => {
  if (!reason || reason.trim() === '') {
    throw new ApiError('Rejection reason is required', 400);
  }

  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError('Pharmacy not found', 404);
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.PENDING) {
    throw new ApiError('Can only reject pharmacies that are in PENDING status', 400);
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.REJECTED;
  profile.verificationNote = reason;
  profile.verifiedBy = adminId;
  profile.verifiedAt = new Date();
  
  await profile.save();
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

const findNearbyPharmacies = async (lng, lat, radiusKm = 10, medicineId = null) => {
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
  if (!medicineId) {
    return await Pharmacy.find(query).select('-ownerUserId -verificationNote -verifiedBy -verifiedAt').lean();
  }

  // If we need to filter by medicine availability, we find available pharmacies first
  const availabilityRecords = await MedicineAvailability.find({
    medicineId,
    status: { $in: ['AVAILABLE', 'LIMITED', 'CONFIRMATION_REQUIRED'] }
  }).select('pharmacyId status lastUpdated');

  const availablePharmacyIds = availabilityRecords.map(record => record.pharmacyId);
  
  query._id = { $in: availablePharmacyIds };

  const nearbyPharmacies = await Pharmacy.find(query).select('-ownerUserId -verificationNote -verifiedBy -verifiedAt').lean();

  // Attach availability status to each pharmacy
  return nearbyPharmacies.map(pharmacy => {
    const record = availabilityRecords.find(r => r.pharmacyId.toString() === pharmacy._id.toString());
    return {
      ...pharmacy,
      availabilityStatus: record.status,
      availabilityLastUpdated: record.lastUpdated
    };
  });
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
};
