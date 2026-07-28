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

    // Verify the pharmacy was actually selected by the customer
    if (!request.selectedPharmacyIds.includes(pharmacyId)) {
      throw new ApiError(403, 'You do not have permission to quote on this request');
    }

    // Check if quotation already exists
    let quotation = await Quotation.findOne({ requestId, pharmacyId });
    if (quotation) {
      return quotation;
    }

    // Map request items to quotation draft items
    const quotationItems = request.items.map(item => ({
      requestItemId: item._id,
      medicineId: item.medicineId,
      medicineSnapshot: item.medicineSnapshot,
      requestedQuantity: item.quantity,
      availableQuantity: 0,
      unitPrice: null,
      subtotal: 0
    }));

    // Create a new draft quotation
    quotation = new Quotation({
      requestId,
      customerId: request.customerId,
      pharmacyId,
      status: QUOTATION_STATUS.DRAFT,
      items: quotationItems
    });

    await quotation.save();
    return quotation;
  }
}

module.exports = new QuotationService();
