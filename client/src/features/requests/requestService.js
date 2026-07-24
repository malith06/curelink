import api from '../../api/axiosClient';

// --- CUSTOMER ENDPOINTS ---

const getMyRequests = async (params = {}) => {
  const response = await api.get('/requests/customer', { params });
  return response.data;
};

const getRequestById = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

const createDraftRequest = async () => {
  const response = await api.post('/requests');
  return response.data;
};

const addItemToRequest = async (requestId, itemData) => {
  const response = await api.post(`/requests/${requestId}/items`, itemData);
  return response.data;
};

const submitRequest = async (requestId, pharmacyIds) => {
  const response = await api.post(`/requests/${requestId}/submit`, { pharmacyIds });
  return response.data;
};

const acceptQuotation = async (requestId, pharmacyId) => {
  const response = await api.post(`/requests/${requestId}/quotations/${pharmacyId}/accept`);
  return response.data;
};

const processPayment = async (requestId) => {
  const response = await api.post(`/requests/${requestId}/payment`);
  return response.data;
};

// --- PHARMACY ENDPOINTS ---

const getPharmacyInbox = async (params = {}) => {
  const response = await api.get('/requests/pharmacy', { params });
  return response.data;
};

const submitQuotation = async (requestId, items) => {
  const response = await api.post(`/requests/${requestId}/quotations`, { items });
  return response.data;
};

const updateRequestStatus = async (requestId, status) => {
  const response = await api.patch(`/requests/${requestId}/status`, { status });
  return response.data;
};

export const requestService = {
  getMyRequests,
  getRequestById,
  createDraftRequest,
  addItemToRequest,
  submitRequest,
  acceptQuotation,
  processPayment,
  getPharmacyInbox,
  submitQuotation,
  updateRequestStatus,
};

export default requestService;
