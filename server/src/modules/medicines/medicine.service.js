const Medicine = require('./medicine.model');
const ApiError = require('../../utils/ApiError');

const createMedicine = async (medicineData, adminId) => {
  const medicine = new Medicine({
    ...medicineData,
    createdBy: adminId,
  });
  await medicine.save();
  return medicine;
};

const getMedicines = async (filters, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  const query = {};
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.prescriptionRequired !== undefined) {
    query.prescriptionRequired = filters.prescriptionRequired;
  }

  const sort = {};
  if (filters.search) {
    sort.score = { $meta: 'textScore' };
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  const items = await Medicine.find(query)
    .skip(skip)
    .limit(limit)
    .sort(sort);
    
  const total = await Medicine.countDocuments(query);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getMedicineById = async (id) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    throw new ApiError('Medicine not found', 404);
  }
  return medicine;
};

const updateMedicine = async (id, updateData) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    throw new ApiError('Medicine not found', 404);
  }
  
  Object.assign(medicine, updateData);
  await medicine.save();
  return medicine;
};

const deleteMedicine = async (id) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    throw new ApiError('Medicine not found', 404);
  }
  await medicine.deleteOne();
  return medicine;
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
