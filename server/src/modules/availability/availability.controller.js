const availabilityService = require('./availability.service');
const asyncHandler = require('../../utils/asyncHandler');

const updateAvailability = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;
  const availability = await availabilityService.updateAvailability(
    req.user._id,
    medicineId,
    req.body
  );

  res.status(200).json({
    success: true,
    data: availability,
  });
});

const getPharmacyInventory = asyncHandler(async (req, res) => {
  const inventory = await availabilityService.getPharmacyInventory(req.user._id);

  res.status(200).json({
    success: true,
    data: inventory,
  });
});

module.exports = {
  updateAvailability,
  getPharmacyInventory,
};
