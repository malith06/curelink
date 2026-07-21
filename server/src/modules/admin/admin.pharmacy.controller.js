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

module.exports = {
  getPharmacies,
};
