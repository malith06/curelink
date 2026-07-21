const pharmacyService = require('./pharmacy.service');
const catchAsync = require('../../utils/catchAsync');

const createPharmacyProfile = catchAsync(async (req, res) => {
  const profile = await pharmacyService.createPharmacyProfile(req.user._id, req.body);
  res.status(201).json({
    success: true,
    data: profile,
  });
});

const getMyPharmacyProfile = catchAsync(async (req, res) => {
  const profile = await pharmacyService.getPharmacyProfileByUserId(req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const updatePharmacyProfile = catchAsync(async (req, res) => {
  const profile = await pharmacyService.updatePharmacyProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

module.exports = {
  createPharmacyProfile,
  getMyPharmacyProfile,
  updatePharmacyProfile,
};
