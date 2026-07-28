import api from '../../api/axiosClient';

// --- PHARMACY ENDPOINTS ---

const getOrCreateDraft = async (requestId) => {
  const response = await api.post(`/quotations/requests/${requestId}/draft`);
  return response.data;
};

const getPharmacyQuotations = async (params = {}) => {
  const response = await api.get('/quotations', { params });
  return response.data;
};

const getQuotationById = async (quotationId) => {
  const response = await api.get(`/quotations/${quotationId}`);
  return response.data;
};

const updateDraft = async (quotationId, updateData) => {
  const response = await api.patch(`/quotations/${quotationId}/draft`, updateData);
  return response.data;
};

const submitQuotation = async (quotationId) => {
  const response = await api.post(`/quotations/${quotationId}/submit`);
  return response.data;
};

// --- CUSTOMER ENDPOINTS ---

const getRequestQuotations = async (requestId) => {
  const response = await api.get(`/requests/${requestId}/quotations`);
  return response.data;
};

const getCustomerQuotationDetails = async (requestId, quotationId) => {
  const response = await api.get(`/requests/${requestId}/quotations/${quotationId}`);
  return response.data;
};

const acceptQuotation = async (requestId, quotationId) => {
  const response = await api.post(`/requests/${requestId}/quotations/${quotationId}/accept`);
  return response.data;
};

const declineQuotation = async (requestId, quotationId) => {
  const response = await api.post(`/requests/${requestId}/quotations/${quotationId}/decline`);
  return response.data;
};

export const quotationService = {
  getOrCreateDraft,
  getPharmacyQuotations,
  getQuotationById,
  updateDraft,
  submitQuotation,
  getRequestQuotations,
  getCustomerQuotationDetails,
  acceptQuotation,
  declineQuotation
};

export default quotationService;
