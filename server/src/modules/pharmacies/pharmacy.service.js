const Pharmacy = require('./pharmacy.model');
const ApiError = require('../../utils/ApiError');
const { PHARMACY_VERIFICATION_STATUS } = require('./pharmacy.constants');

const createPharmacyProfile = async (userId, profileData) => {
  const existingProfile = await Pharmacy.findOne({ ownerUserId: userId });
  if (existingProfile) {
    throw new ApiError(400, 'Pharmacy profile already exists for this user');
  }

  const existingRegistration = await Pharmacy.findOne({ registrationNumber: profileData.registrationNumber });
  if (existingRegistration) {
    throw new ApiError(400, 'Registration number is already in use');
  }

  const profile = await Pharmacy.create({
    ...profileData,
    ownerUserId: userId,
  });

  return profile;
};

const getPharmacyProfileByUserId = async (userId) => {
  const profile = await Pharmacy.findOne({ ownerUserId: userId });
  if (!profile) {
    throw new ApiError(404, 'Pharmacy profile not found');
  }
  return profile;
};

const updatePharmacyProfile = async (userId, updateData) => {
  const profile = await Pharmacy.findOne({ ownerUserId: userId });
  if (!profile) {
    throw new ApiError(404, 'Pharmacy profile not found');
  }

  if (profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.PENDING) {
    throw new ApiError(400, 'Cannot edit profile while verification is pending');
  }

  if (
    profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.APPROVED ||
    profile.verificationStatus === PHARMACY_VERIFICATION_STATUS.SUSPENDED
  ) {
    const allowedFields = ['phone', 'openingHours', 'deliveryAvailable', 'pickupAvailable'];
    const keys = Object.keys(updateData);
    const hasDisallowed = keys.some((key) => !allowedFields.includes(key));
    if (hasDisallowed) {
      throw new ApiError(400, 'Cannot update critical fields after approval. Please contact support.');
    }
  }

  if (updateData.registrationNumber && updateData.registrationNumber !== profile.registrationNumber) {
    const existingRegistration = await Pharmacy.findOne({ registrationNumber: updateData.registrationNumber });
    if (existingRegistration) {
      throw new ApiError(400, 'Registration number is already in use');
    }
  }

  Object.assign(profile, updateData);
  await profile.save();
  return profile;
};

const submitForVerification = async (userId) => {
  const profile = await Pharmacy.findOne({ ownerUserId: userId });
  if (!profile) {
    throw new ApiError(404, 'Pharmacy profile not found');
  }

  if (
    profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.DRAFT &&
    profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.REJECTED
  ) {
    throw new ApiError(400, 'Profile cannot be submitted for verification from current status');
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.PENDING;
  profile.verificationNote = ''; // Clear previous rejection notes
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
    throw new ApiError(404, 'Pharmacy not found');
  }
  return profile;
};

const approvePharmacy = async (pharmacyId, adminId) => {
  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError(404, 'Pharmacy not found');
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.PENDING) {
    throw new ApiError(400, 'Can only approve pharmacies that are in PENDING status');
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
    throw new ApiError(400, 'Rejection reason is required');
  }

  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError(404, 'Pharmacy not found');
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.PENDING) {
    throw new ApiError(400, 'Can only reject pharmacies that are in PENDING status');
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
    throw new ApiError(400, 'Suspension reason is required');
  }

  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError(404, 'Pharmacy not found');
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.APPROVED) {
    throw new ApiError(400, 'Can only suspend pharmacies that are currently APPROVED');
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.SUSPENDED;
  profile.verificationNote = reason;
  
  await profile.save();
  return profile;
};

const reactivatePharmacy = async (pharmacyId, adminId) => {
  const profile = await Pharmacy.findById(pharmacyId);
  if (!profile) {
    throw new ApiError(404, 'Pharmacy not found');
  }
  
  if (profile.verificationStatus !== PHARMACY_VERIFICATION_STATUS.SUSPENDED) {
    throw new ApiError(400, 'Can only reactivate pharmacies that are currently SUSPENDED');
  }

  profile.verificationStatus = PHARMACY_VERIFICATION_STATUS.APPROVED;
  profile.verificationNote = ''; // Clear suspension reason
  
  await profile.save();
  return profile;
};

module.exports = {
  createPharmacyProfile,
  getPharmacyProfileByUserId,
  updatePharmacyProfile,
  submitForVerification,
  getPharmacies,
  getPharmacyById,
  approvePharmacy,
  rejectPharmacy,
  suspendPharmacy,
  reactivatePharmacy,
};
