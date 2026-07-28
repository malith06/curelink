const mongoose = require('mongoose');
const Quotation = require('./quotation.model');
const MedicineRequest = require('../requests/request.model');
const Medicine = require('../medicines/medicine.model');
const PrescriptionVerification = require('../prescription-verifications/verification.model');
const { QUOTATION_STATUS } = require('./quotation.constants');
const { calculateItemAvailability, calculateItemSubtotal, calculateQuotationTotal, toCents } = require('./quotation.calculator');
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
      for (const updateItem of updateData.items) {
        // Find the corresponding item in the quotation
        const itemIndex = quotation.items.findIndex(i => 
          i.requestItemId.toString() === updateItem.requestItemId.toString()
        );

        if (itemIndex > -1) {
          const item = quotation.items[itemIndex];
          
          if (updateItem.availableQuantity !== undefined) item.availableQuantity = updateItem.availableQuantity;
          if (updateItem.unitPrice !== undefined) item.unitPrice = updateItem.unitPrice;
          if (updateItem.pharmacyItemNote !== undefined) item.pharmacyItemNote = updateItem.pharmacyItemNote;

          if (updateItem.substitutionOffered !== undefined) {
            item.substitutionOffered = updateItem.substitutionOffered;
            
            if (!updateItem.substitutionOffered) {
              // Clear substitution if not offered
              item.substitutionMedicineId = null;
              item.substitutionSnapshot = null;
              item.substitutionNote = null;
            } else {
              // Apply substitution
              if (updateItem.substitutionNote !== undefined) {
                item.substitutionNote = updateItem.substitutionNote;
              }
              
              if (updateItem.substitutionMedicineId) {
                item.substitutionMedicineId = updateItem.substitutionMedicineId;
                // Fetch the medicine snapshot to save
                const substitute = await Medicine.findById(updateItem.substitutionMedicineId);
                if (substitute) {
                  item.substitutionSnapshot = {
                    genericName: substitute.genericName,
                    brandName: substitute.brandName,
                    strength: substitute.strength,
                    dosageForm: substitute.dosageForm
                  };
                }
              }
            }
          }

          // Recalculate item availability and subtotal
          item.availabilityResult = calculateItemAvailability(item.requestedQuantity, item.availableQuantity);
          
          // If unit price was updated, it's expected as standard decimal and should be stored in cents,
          // but since updateData might already contain cents depending on validation, we ensure it's calculated correctly.
          // Wait, the validation allows float inputs, we convert here.
          // Actually, we'll assume updateData.unitPrice is in cents if processed by middleware, or we explicitly convert it.
          // Let's explicitly convert it here to be safe.
          if (updateItem.unitPrice !== undefined && updateItem.unitPrice !== null) {
            item.unitPrice = toCents(updateItem.unitPrice);
          }
          item.subtotal = calculateItemSubtotal(item.availableQuantity, item.unitPrice);
        }
      }
    }

    // Process top-level delivery fee to cents if provided
    if (updateData.deliveryFee !== undefined && updateData.deliveryFee !== null) {
      quotation.deliveryFee = toCents(updateData.deliveryFee);
    }

    // Recalculate quotation subtotal and total
    quotation.subtotal = quotation.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    quotation.total = calculateQuotationTotal(quotation.items, quotation.deliveryFee);

    await quotation.save();
    return quotation;
  }

  /**
   * Submits a draft quotation, verifying it meets all completeness and fulfilment criteria.
   * @param {string} quotationId 
   * @param {string} pharmacyId 
   * @returns {Promise<Object>} Submitted quotation
   */
  async submitQuotation(quotationId, pharmacyId) {
    const quotation = await Quotation.findOne({ _id: quotationId, pharmacyId });
    
    if (!quotation) {
      throw new ApiError(404, 'Quotation not found');
    }

    if (quotation.status !== QUOTATION_STATUS.DRAFT) {
      throw new ApiError(400, 'Only draft quotations can be submitted');
    }

    // 1. Validate fulfilment options
    if (!quotation.deliveryAvailable && !quotation.pickupAvailable) {
      throw new ApiError(400, 'At least one fulfilment option (delivery or pickup) must be selected');
    }
    
    if (!quotation.preparationMinutes) {
      throw new ApiError(400, 'Preparation time is required');
    }

    if (!quotation.expiresAt || new Date(quotation.expiresAt) <= new Date()) {
      throw new ApiError(400, 'A valid future expiration date is required');
    }

    // 2. Enforce Prescription Verification
    const request = await MedicineRequest.findById(quotation.requestId);
    if (!request) {
      throw new ApiError(404, 'Associated medicine request not found');
    }

    if (request.requiresPrescription) {
      const verification = await PrescriptionVerification.findOne({
        requestId: request._id,
        pharmacyId: pharmacyId
      });

      if (!verification || verification.status !== 'VERIFIED') {
        throw new ApiError(403, 'You must verify the prescription before submitting a quotation for this request');
      }
    }

    // 3. Prevent completely empty/zero-value quotes from being submitted
    if (quotation.total <= 0) {
      throw new ApiError(400, 'Cannot submit a quotation with a total value of 0');
    }

    // 4. Mark as submitted
    quotation.status = QUOTATION_STATUS.SUBMITTED;
    quotation.submittedAt = new Date();

    // The update to MedicineRequest will be handled via a transaction to guarantee atomicity
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await quotation.save({ session });

      // Update the request document
      const requestUpdate = {
        $inc: { quotationCount: 1 }
      };

      if (request.status === 'SUBMITTED') {
        requestUpdate.$set = {
          status: 'QUOTATIONS_RECEIVED',
          firstQuotationReceivedAt: new Date()
        };
      }

      await MedicineRequest.findByIdAndUpdate(
        request._id,
        requestUpdate,
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return quotation;
  }
}

module.exports = new QuotationService();
