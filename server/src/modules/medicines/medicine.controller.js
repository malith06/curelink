const medicineService = require('./medicine.service');
const asyncHandler = require('../../utils/asyncHandler');

const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await medicineService.createMedicine(req.body, req.user._id);
  res.status(201).json({
    success: true,
    data: medicine,
  });
});

const getMedicines = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    category: req.query.category,
    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    prescriptionRequired: req.query.prescriptionRequired !== undefined ? req.query.prescriptionRequired === 'true' : undefined,
  };
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  };

  const result = await medicineService.getMedicines(filters, options);
  res.status(200).json({
    success: true,
    data: result,
  });
});

const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await medicineService.getMedicineById(req.params.id);
  res.status(200).json({
    success: true,
    data: medicine,
  });
});

const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await medicineService.updateMedicine(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: medicine,
  });
});

const deleteMedicine = asyncHandler(async (req, res) => {
  await medicineService.deleteMedicine(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Medicine deleted successfully',
  });
});

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
