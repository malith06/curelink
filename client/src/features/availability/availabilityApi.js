import api from '../../api/axios';

const getMyAvailability = async (params = {}) => {
  const response = await api.get('/pharmacies/me/availability', { params });
  return response.data;
};

const updateAvailability = async (medicineId, data) => {
  const response = await api.put(`/pharmacies/me/availability/${medicineId}`, data);
  return response.data;
};

export const availabilityApi = {
  getMyAvailability,
  updateAvailability,
};

export default availabilityApi;
