const pharmacyService = require('./pharmacy.service');
const requestService = require('../requests/request.service');
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

const updatePharmacyLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError('Latitude and longitude are required', 400);
  }

  const profile = await pharmacyService.updatePharmacyLocation(
    req.user._id,
    parseFloat(latitude),
    parseFloat(longitude)
  );

  res.status(200).json({
    success: true,
    data: profile,
  });
});

const findNearbyPharmacies = asyncHandler(async (req, res) => {
  const { lng, lat, radiusKm, medicineId } = req.query;

  if (!lng || !lat) {
    throw new ApiError('Longitude and latitude are required', 400);
  }

  const radius = radiusKm ? parseFloat(radiusKm) : 10;
  
  if (isNaN(radius) || radius <= 0 || radius > 100) {
    throw new ApiError('Radius must be a positive number up to 100km', 400);
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

const getPharmacyInboxRequests = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.getPharmacyProfileByUserId(req.user._id);
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }
  
  const { status } = req.query;
  const requests = await requestService.getPharmacyInbox(profile._id, { status });
  
  res.status(200).json({
    success: true,
    data: requests,
  });
});

module.exports = {
  createPharmacyProfile,
  getMyPharmacyProfile,
  updatePharmacyProfile,
  submitForVerification,
  updatePharmacyLocation,
  findNearbyPharmacies,
  getPharmacyInboxRequests
};
