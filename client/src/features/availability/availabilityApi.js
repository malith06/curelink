import api from '../../api/axiosClient';

const getMyAvailability = async (params = {}) => {
  const response = await api.get('/availability/inventory', { params });
  return response.data;
};

const updateAvailability = async (medicineId, data) => {
  const response = await api.put(`/availability/${medicineId}`, data);
  return response.data;
};

export const availabilityApi = {
  getMyAvailability,
  updateAvailability,
};

export default availabilityApi;
