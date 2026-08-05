import api from '../../api/axiosClient';

// --- PHARMACIES ---
const getPharmacies = async (params = {}) => {
  const response = await api.get('/admin/pharmacies', { params });
  return response.data;
};

const getPharmacyById = async (id) => {
  const response = await api.get(`/admin/pharmacies/${id}`);
  return response.data;
};

const updatePharmacyStatus = async (id, action) => {
  // action can be: 'approve', 'reject', 'suspend', 'reactivate'
  const response = await api.patch(`/admin/pharmacies/${id}/${action}`);
  return response.data;
};

// --- MEDICINES ---
const getMedicines = async (params = {}) => {
  const response = await api.get('/admin/medicines', { params });
  return response.data;
};

const getMedicineById = async (id) => {
  const response = await api.get(`/admin/medicines/${id}`);
  return response.data;
};

const createMedicine = async (data) => {
  const response = await api.post('/admin/medicines', data);
  return response.data;
};

const updateMedicine = async (id, data) => {
  const response = await api.put(`/admin/medicines/${id}`, data);
  return response.data;
};

const deleteMedicine = async (id) => {
  const response = await api.delete(`/admin/medicines/${id}`);
  return response.data;
};

// --- PAYMENTS ---
const getAllPayments = async (params = {}) => {
  const response = await api.get('/admin/payments', { params });
  return response.data;
};

export const adminService = {
  getPharmacies,
  getPharmacyById,
  updatePharmacyStatus,
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllPayments,
};

export default adminService;
