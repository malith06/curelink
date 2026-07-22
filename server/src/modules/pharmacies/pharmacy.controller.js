const pharmacyService = require('./pharmacy.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

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

const findNearbyPharmacies = asyncHandler(async (req, res) => {
  const { lng, lat, radiusKm, medicineId } = req.query;

  if (!lng || !lat) {
    throw new ApiError(400, 'Longitude and latitude are required');
  }

  const radius = radiusKm ? parseFloat(radiusKm) : 10;
  
  if (isNaN(radius) || radius <= 0 || radius > 100) {
    throw new ApiError(400, 'Radius must be a positive number up to 100km');
  }

  const pharmacies = await pharmacyService.findNearbyPharmacies(
    parseFloat(lng),
    parseFloat(lat),
    radius,
    medicineId
  );

  res.status(200).json({
    success: true,
    count: pharmacies.length,
    data: pharmacies,
  });
});

module.exports = {
  createPharmacyProfile,
  getMyPharmacyProfile,
  updatePharmacyProfile,
  submitForVerification,
  findNearbyPharmacies,
};
