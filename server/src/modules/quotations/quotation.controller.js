const quotationService = require('./quotation.service');
const catchAsync = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { formatCentsToDollars } = require('./quotation.calculator');
const Pharmacy = require('../pharmacies/pharmacy.model');

const getPharmacyId = async (userId) => {
  const pharmacy = await Pharmacy.findOne({ ownerUserId: userId });
  if (!pharmacy) {
    throw new ApiError(403, 'User does not belong to a pharmacy');
  }
  return pharmacy._id;
};

const quotationController = {
  getOrCreateDraft: catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const pharmacyId = await getPharmacyId(req.user._id);

    const draft = await quotationService.getOrCreateDraft(requestId, pharmacyId);
    
    // Convert cents back to dollars for frontend
    const formattedDraft = { ...draft.toObject() };
    if (formattedDraft.total !== undefined) formattedDraft.total = formatCentsToDollars(formattedDraft.total);
    if (formattedDraft.subtotal !== undefined) formattedDraft.subtotal = formatCentsToDollars(formattedDraft.subtotal);
    if (formattedDraft.deliveryFee !== undefined) formattedDraft.deliveryFee = formatCentsToDollars(formattedDraft.deliveryFee);
    
    if (formattedDraft.items) {
      formattedDraft.items = formattedDraft.items.map(item => {
        if (item.unitPrice !== undefined && item.unitPrice !== null) item.unitPrice = formatCentsToDollars(item.unitPrice);
        if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
        return item;
      });
    }

    res.status(200).json({
      success: true,
      data: formattedDraft
    });
  }),

  updateDraft: catchAsync(async (req, res) => {
    const { quotationId } = req.params;
    const pharmacyId = await getPharmacyId(req.user._id);

    const updatedDraft = await quotationService.updateDraft(quotationId, pharmacyId, req.body);
    
    // Convert cents back to dollars
    const formattedDraft = { ...updatedDraft.toObject() };
    if (formattedDraft.total !== undefined) formattedDraft.total = formatCentsToDollars(formattedDraft.total);
    if (formattedDraft.subtotal !== undefined) formattedDraft.subtotal = formatCentsToDollars(formattedDraft.subtotal);
    if (formattedDraft.deliveryFee !== undefined) formattedDraft.deliveryFee = formatCentsToDollars(formattedDraft.deliveryFee);
    
    if (formattedDraft.items) {
      formattedDraft.items = formattedDraft.items.map(item => {
        if (item.unitPrice !== undefined && item.unitPrice !== null) item.unitPrice = formatCentsToDollars(item.unitPrice);
        if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
        return item;
      });
    }

    res.status(200).json({
      success: true,
      data: formattedDraft
    });
  }),

  submitQuotation: catchAsync(async (req, res) => {
    const { quotationId } = req.params;
    const pharmacyId = await getPharmacyId(req.user._id);

    const submittedQuotation = await quotationService.submitQuotation(quotationId, pharmacyId);
    
    const formattedQuotation = { ...submittedQuotation.toObject() };
    if (formattedQuotation.total !== undefined) formattedQuotation.total = formatCentsToDollars(formattedQuotation.total);
    if (formattedQuotation.subtotal !== undefined) formattedQuotation.subtotal = formatCentsToDollars(formattedQuotation.subtotal);
    if (formattedQuotation.deliveryFee !== undefined) formattedQuotation.deliveryFee = formatCentsToDollars(formattedQuotation.deliveryFee);
    
    if (formattedQuotation.items) {
      formattedQuotation.items = formattedQuotation.items.map(item => {
        if (item.unitPrice !== undefined && item.unitPrice !== null) item.unitPrice = formatCentsToDollars(item.unitPrice);
        if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
        return item;
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quotation submitted successfully',
      data: formattedQuotation
    });
  }),

  getQuotation: catchAsync(async (req, res) => {
    const { quotationId } = req.params;
    let pharmacyId = null;
    
    if (req.user.role === 'PHARMACY') {
      pharmacyId = await getPharmacyId(req.user._id);
    }

    const quotation = await quotationService.getQuotationById(quotationId, pharmacyId);
    
    const formattedQuotation = { ...quotation.toObject() };
    if (formattedQuotation.total !== undefined) formattedQuotation.total = formatCentsToDollars(formattedQuotation.total);
    if (formattedQuotation.subtotal !== undefined) formattedQuotation.subtotal = formatCentsToDollars(formattedQuotation.subtotal);
    if (formattedQuotation.deliveryFee !== undefined) formattedQuotation.deliveryFee = formatCentsToDollars(formattedQuotation.deliveryFee);
    
    if (formattedQuotation.items) {
      formattedQuotation.items = formattedQuotation.items.map(item => {
        if (item.unitPrice !== undefined && item.unitPrice !== null) item.unitPrice = formatCentsToDollars(item.unitPrice);
        if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
        return item;
      });
    }

    res.status(200).json({
      success: true,
      data: formattedQuotation
    });
  }),

  listPharmacyQuotations: catchAsync(async (req, res) => {
    const pharmacyId = await getPharmacyId(req.user._id);

    const result = await quotationService.listPharmacyQuotations(pharmacyId, req.query);
    
    // Format all quotations in the list
    result.quotations = result.quotations.map(q => {
      const formatted = { ...q.toObject() };
      if (formatted.total !== undefined) formatted.total = formatCentsToDollars(formatted.total);
      if (formatted.subtotal !== undefined) formatted.subtotal = formatCentsToDollars(formatted.subtotal);
      if (formatted.deliveryFee !== undefined) formatted.deliveryFee = formatCentsToDollars(formatted.deliveryFee);
      return formatted;
    });

    res.status(200).json({
      success: true,
      data: result
    });
  })
};

module.exports = quotationController;
