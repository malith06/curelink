import api from '../../api/axiosClient';

/**
 * Uploads a prescription file for a specific request.
 * @param {string} requestId 
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const uploadPrescription = async (requestId, file) => {
  const formData = new FormData();
  formData.append('prescription', file);

  const response = await api.post(`/requests/${requestId}/prescription`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Triggers OCR processing on a prescription.
 * @param {string} prescriptionId 
 * @returns {Promise<Object>}
 */
export const processOcr = async (prescriptionId) => {
  const response = await api.post(`/prescriptions/${prescriptionId}/process-ocr`);
  return response.data;
};

/**
 * Gets the current OCR results for a prescription.
 * @param {string} prescriptionId 
 * @returns {Promise<Object>}
 */
export const getOcrResults = async (prescriptionId) => {
  const response = await api.get(`/prescriptions/${prescriptionId}/ocr`);
  return response.data;
};

/**
 * Updates the OCR entries with customer corrections.
 * @param {string} prescriptionId 
 * @param {Array<Object>} entries 
 * @returns {Promise<Object>}
 */
export const updateOcrEntries = async (prescriptionId, entries) => {
  const response = await api.put(`/prescriptions/${prescriptionId}/ocr`, { entries });
  return response.data;
};

/**
 * Confirms the prescription review and syncs it with the request.
 * @param {string} prescriptionId 
 * @returns {Promise<Object>}
 */
export const confirmPrescription = async (prescriptionId) => {
  const response = await api.post(`/prescriptions/${prescriptionId}/confirm`);
  return response.data;
};

/**
 * Submits a pharmacist's verification for a prescription.
 * @param {string} prescriptionId 
 * @param {Object} verificationData 
 * @returns {Promise<Object>}
 */
export const submitVerification = async (prescriptionId, verificationData) => {
  const response = await api.post(`/prescriptions/${prescriptionId}/verify`, verificationData);
  return response.data;
};

/**
 * Gets a secure, short-lived URL to view the prescription file.
 * @param {string} prescriptionId 
 * @returns {Promise<Object>}
 */
export const getPrescriptionAccessUrl = async (prescriptionId) => {
  const response = await api.get(`/prescriptions/${prescriptionId}/access`);
  return response.data;
};

const prescriptionService = {
  uploadPrescription,
  processOcr,
  getOcrResults,
  updateOcrEntries,
  confirmPrescription,
  submitVerification,
  getPrescriptionAccessUrl,
};

export default prescriptionService;
