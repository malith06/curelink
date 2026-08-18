import api from '../../api/axiosClient';

const getCustomerDashboard = async () => {
  const response = await api.get('/dashboards/customer');
  return response.data;
};

const getPharmacyDashboard = async (params = { range: '30d' }) => {
  const response = await api.get('/dashboards/pharmacy', { params });
  return response.data;
};

const getAdminDashboard = async (params = { range: '30d' }) => {
  const response = await api.get('/dashboards/admin', { params });
  return response.data;
};

export const dashboardService = {
  getCustomerDashboard,
  getPharmacyDashboard,
  getAdminDashboard,
};

export default dashboardService;
