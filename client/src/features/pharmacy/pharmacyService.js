import api from '../../api/axios';

const getMyPharmacyProfile = async () => {
  const response = await api.get('/pharmacies/me/profile');
  return response.data;
};

const createPharmacyProfile = async (profileData) => {
  const response = await api.post('/pharmacies/me/profile', profileData);
  return response.data;
};

const updatePharmacyProfile = async (profileData) => {
  const response = await api.patch('/pharmacies/me/profile', profileData);
  return response.data;
};

const submitForVerification = async () => {
  const response = await api.post('/pharmacies/me/submit-verification');
  return response.data;
};

const pharmacyService = {
  getMyPharmacyProfile,
  createPharmacyProfile,
  updatePharmacyProfile,
  submitForVerification,
};

export default pharmacyService;
