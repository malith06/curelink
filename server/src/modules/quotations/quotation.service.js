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

  /**
   * Updates a draft quotation with new item prices, quantities, and pharmacy settings.
   * Only allowed when status is DRAFT.
   * @param {string} quotationId 
   * @param {string} pharmacyId 
   * @param {Object} updateData 
   * @returns {Promise<Object>} Updated quotation
   */
  async updateDraft(quotationId, pharmacyId, updateData) {
    const quotation = await Quotation.findOne({ _id: quotationId, pharmacyId });
    
    if (!quotation) {
      throw new ApiError(404, 'Quotation not found');
    }

    if (quotation.status !== QUOTATION_STATUS.DRAFT) {
      throw new ApiError(400, 'Only draft quotations can be updated');
    }

    // Update top-level fields if provided
    if (updateData.deliveryFee !== undefined) quotation.deliveryFee = updateData.deliveryFee;
    if (updateData.preparationMinutes !== undefined) quotation.preparationMinutes = updateData.preparationMinutes;
    if (updateData.deliveryAvailable !== undefined) quotation.deliveryAvailable = updateData.deliveryAvailable;
    if (updateData.pickupAvailable !== undefined) quotation.pickupAvailable = updateData.pickupAvailable;
    if (updateData.expiresAt !== undefined) quotation.expiresAt = updateData.expiresAt;
    if (updateData.pharmacyNotes !== undefined) quotation.pharmacyNotes = updateData.pharmacyNotes;

    // Update items if provided
    if (updateData.items && Array.isArray(updateData.items)) {
      updateData.items.forEach(updateItem => {
        // Find the corresponding item in the quotation
        const itemIndex = quotation.items.findIndex(i => 
          i.requestItemId.toString() === updateItem.requestItemId.toString()
        );

        if (itemIndex > -1) {
          const item = quotation.items[itemIndex];
          
          if (updateItem.availableQuantity !== undefined) item.availableQuantity = updateItem.availableQuantity;
          if (updateItem.unitPrice !== undefined) item.unitPrice = updateItem.unitPrice;
          if (updateItem.pharmacyItemNote !== undefined) item.pharmacyItemNote = updateItem.pharmacyItemNote;
        }
      });
    }

    await quotation.save();
    return quotation;
  }
}

module.exports = new QuotationService();
