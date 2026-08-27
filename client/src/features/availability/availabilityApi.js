import api from '../../api/axiosClient';

const getMyAvailability = async (params = {}) => {
  const response = await api.get('/availability/inventory', { params });
  return response.data;
};

const updateAvailability = async (medicineId, data) => {
  const response = await api.put(`/availability/${medicineId}`, data);
  return response.data;
};

const deleteAvailability = async (medicineId) => {
  const response = await api.delete(`/availability/${medicineId}`);
  return response.data;
};

export const availabilityApi = {
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
};

export default availabilityApi;
