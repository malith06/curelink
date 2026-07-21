const Pharmacy = require('./pharmacy.model');
const ApiError = require('../../utils/ApiError');

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

module.exports = {
  createPharmacyProfile,
};
