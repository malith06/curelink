const Quotation = require('./quotation.model');
const MedicineRequest = require('../requests/request.model');
const { QUOTATION_STATUS } = require('./quotation.constants');
const ApiError = require('../../utils/ApiError');

class QuotationService {
  /**
   * Initializes a new draft quotation for a specific request and pharmacy.
   * If a draft already exists, it returns the existing one.
   * @param {string} requestId 
   * @param {string} pharmacyId 
   * @returns {Promise<Object>} Quotation document
   */
  async getOrCreateDraft(requestId, pharmacyId) {
    const request = await MedicineRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Medicine request not found');
    }

    // Check if the request is still open for quotations
    if (['CANCELLED', 'EXPIRED', 'QUOTATION_ACCEPTED', 'CONVERTED_TO_ORDER', 'PROCESSING', 'READY_FOR_PICKUP', 'DISPATCHED', 'COMPLETED'].includes(request.status)) {
      throw new ApiError(400, 'This request is no longer accepting quotations');
    }

    // Check if quotation already exists
    let quotation = await Quotation.findOne({ requestId, pharmacyId });
    if (quotation) {
      return quotation;
    }

    // Create a new draft quotation
    quotation = new Quotation({
      requestId,
      customerId: request.customerId,
      pharmacyId,
      status: QUOTATION_STATUS.DRAFT,
      items: [] // Will be populated in next step
    });

    await quotation.save();
    return quotation;
  }
}

module.exports = new QuotationService();
