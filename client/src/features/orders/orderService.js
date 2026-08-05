import api from '../../api/axiosClient';

// --- CUSTOMER ENDPOINTS ---

const createOrderFromQuotation = async (quotationId, orderData) => {
  const response = await api.post(`/orders/from-quotation/${quotationId}`, orderData);
  return response.data;
};

const getMyOrders = async (params = {}) => {
  const response = await api.get('/orders/my', { params });
  return response.data;
};

const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

// --- PHARMACY ENDPOINTS ---

const getPharmacyOrders = async (params = {}) => {
  const response = await api.get('/pharmacy/orders', { params });
  return response.data;
};

const getPharmacyOrderById = async (orderId) => {
  const response = await api.get(`/pharmacy/orders/${orderId}`);
  return response.data;
};

const acceptOrder = async (orderId) => {
  const response = await api.post(`/pharmacy/orders/${orderId}/accept`);
  return response.data;
};

const rejectOrder = async (orderId, reason) => {
  const response = await api.post(`/pharmacy/orders/${orderId}/reject`, { reason });
  return response.data;
};

const updateOrderStatus = async (orderId, status, note = '') => {
  const response = await api.patch(`/pharmacy/orders/${orderId}/status`, { status, note });
  return response.data;
};

// --- PAYMENT ENDPOINTS ---

const createCardSession = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/payments/card/session`);
  return response.data;
};

const selectCOD = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/payments/cod`);
  return response.data;
};

const collectCOD = async (orderId) => {
  const response = await api.post(`/pharmacy/orders/${orderId}/payments/cod/collect`);
  return response.data;
};

export const orderService = {
  createOrderFromQuotation,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getPharmacyOrders,
  getPharmacyOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  createCardSession,
  selectCOD,
  collectCOD
};

export default orderService;
