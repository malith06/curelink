const pharmacyService = require('../pharmacies/pharmacy.service');
const asyncHandler = require('../../utils/asyncHandler');

const getPharmacies = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    search: req.query.search,
  };
  const options = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await pharmacyService.getPharmacies(filters, options);
  res.status(200).json({
    success: true,
    data: result,
  });
});

const getPharmacyById = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.getPharmacyById(req.params.pharmacyId);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const approvePharmacy = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.approvePharmacy(req.params.pharmacyId, req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const rejectPharmacy = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.rejectPharmacy(req.params.pharmacyId, req.body?.reason, req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const suspendPharmacy = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.suspendPharmacy(req.params.pharmacyId, req.body?.reason, req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const reactivatePharmacy = asyncHandler(async (req, res) => {
  const profile = await pharmacyService.reactivatePharmacy(req.params.pharmacyId, req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

module.exports = {
  getPharmacies,
  getPharmacyById,
  approvePharmacy,
  rejectPharmacy,
  suspendPharmacy,
  reactivatePharmacy,
};
