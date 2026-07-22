const pharmacyService = require('../pharmacies/pharmacy.service');
const catchAsync = require('../../utils/catchAsync');

const getPharmacies = catchAsync(async (req, res) => {
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

const getPharmacyById = catchAsync(async (req, res) => {
  const profile = await pharmacyService.getPharmacyById(req.params.pharmacyId);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const approvePharmacy = catchAsync(async (req, res) => {
  const profile = await pharmacyService.approvePharmacy(req.params.pharmacyId, req.user._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const rejectPharmacy = catchAsync(async (req, res) => {
  const profile = await pharmacyService.rejectPharmacy(req.params.pharmacyId, req.body.reason, req.user._id);
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
};
