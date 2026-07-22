const pharmacyService = require('./pharmacy.service');
const asyncHandler = require('../../utils/asyncHandler');

const createPharmacyProfile = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.createPharmacyProfile(req.user._id, req.body);
  res.status(201).json({
    success: true,
    data: profile,
  });
});

const getMyPharmacyProfile = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.getPharmacyProfileByUserId(req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const updatePharmacyProfile = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.updatePharmacyProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const submitForVerification = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.submitForVerification(req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

module.exports = {
  createPharmacyProfile,
  getMyPharmacyProfile,
  updatePharmacyProfile,
  submitForVerification,
};
