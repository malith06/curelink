const pharmacyService = require('./pharmacy.service');
const requestService = require('../requests/request.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const cloudinaryAdapter = require('../storage/cloudinary.adapter');

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
  const { lng, lat, radiusKm, medicineId, medicineIds } = req.query;

  if (lng === undefined || lat === undefined || lng === '' || lat === '') {
    throw new ApiError('Longitude and latitude are required', 400);
  }

  const radius = radiusKm ? parseFloat(radiusKm) : (req.query.radius ? parseFloat(req.query.radius) : 10);
  
  if (isNaN(radius) || radius <= 0) {
    throw new ApiError('Radius must be a positive number', 400);
  }

  // Support both single medicineId (legacy) or medicineIds (new comma-separated list)
  let idsToSearch = null;
  if (medicineIds) {
    idsToSearch = medicineIds.split(',').map(id => id.trim()).filter(Boolean);
  } else if (medicineId) {
    idsToSearch = [medicineId.trim()];
  }

  const pharmacies = await pharmacyService.findNearbyPharmacies(
    parseFloat(lng),
    parseFloat(lat),
    radius,
    idsToSearch
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
  
  const { status, page, limit, sort } = req.query;
  const result = await requestService.getPharmacyInbox(profile._id, { status, page, limit, sort });
  
  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

const getPharmacyRequestDetails = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.getPharmacyProfileByUserId(req.user._id);
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }
  
  const { requestId } = req.params;
  const request = await requestService.getPharmacyRequestById(requestId, profile._id);
  
  res.status(200).json({
    success: true,
    data: request,
  });
});

const provideQuotation = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.getPharmacyProfileByUserId(req.user._id);
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }
  
  const { requestId } = req.params;
  const quotationData = req.body;
  
  const request = await requestService.providePharmacyQuotation(requestId, profile._id, quotationData);
  
  res.status(200).json({
    success: true,
    message: 'Quotation provided successfully',
    data: request,
  });
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.getPharmacyProfileByUserId(req.user._id);
  if (!profile) {
    throw new ApiError('Pharmacy profile not found', 404);
  }
  
  const { requestId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    throw new ApiError('Status is required', 400);
  }

  const request = await requestService.updatePharmacyRequestStatus(requestId, profile._id, status);
  
  res.status(200).json({
    success: true,
    message: `Request status updated to ${status}`,
    data: request,
  });
});

const uploadPharmacyPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError('No image file provided', 400);
  }

  // Upload to Cloudinary with public access
  const uploadResult = await cloudinaryAdapter.uploadFile(req.file.buffer, {
    folder: 'pharmacies',
    type: 'upload', // Makes it publicly accessible
  });

  let photoUrl = uploadResult.secureUrl;
  try {
    const profile = await pharmacyService.updatePharmacyPhotoUrl(req.user._id, photoUrl);
    photoUrl = profile.photoUrl;
  } catch (err) {
    // If profile doesn't exist yet (first time setup), it's fine. We just return the URL to be used in profile creation.
  }

  res.status(200).json({
    success: true,
    data: {
      photoUrl,
    },
  });
});

const getVerifiedPharmacies = asyncHandler(async (req, res) => {
  const pharmacies = await pharmacyService.getVerifiedPharmacies();
  res.status(200).json({
    success: true,
    data: pharmacies,
  });
});

module.exports = {
  createPharmacyProfile,
  getMyPharmacyProfile,
  updatePharmacyProfile,
  submitForVerification,
  updatePharmacyLocation,
  findNearbyPharmacies,
  getPharmacyInboxRequests,
  getPharmacyRequestDetails,
  provideQuotation,
  updateRequestStatus,
  uploadPharmacyPhoto,
  getVerifiedPharmacies,
};
