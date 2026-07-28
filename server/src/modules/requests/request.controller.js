const requestService = require('./request.service');
const quotationService = require('../quotations/quotation.service');
const { formatCentsToDollars } = require('../quotations/quotation.calculator');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new draft medicine request
 * @route   POST /api/v1/requests
 * @access  Private (Customer only)
 */
const createDraftRequest = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const request = await requestService.createDraftRequest(customerId);
    
    res.status(201).json({
      success: true,
      message: 'Draft request created successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a medicine item to a draft request
 * @route   POST /api/v1/requests/:requestId/items
 * @access  Private (Customer only)
 */
const addItemToRequest = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId } = req.params;
    const itemData = req.body;

    const request = await requestService.addItemToRequest(requestId, customerId, itemData);
    
    res.status(200).json({
      success: true,
      message: 'Item added to request successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a medicine item in a draft request
 * @route   PATCH /api/v1/requests/:requestId/items/:medicineId
 * @access  Private (Customer only)
 */
const updateRequestItem = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId, medicineId } = req.params;
    const updateData = req.body;

    const request = await requestService.updateRequestItem(requestId, customerId, medicineId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a medicine item from a draft request
 * @route   DELETE /api/v1/requests/:requestId/items/:medicineId
 * @access  Private (Customer only)
 */
const removeRequestItem = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId, medicineId } = req.params;

    const request = await requestService.removeRequestItem(requestId, customerId, medicineId);
    
    res.status(200).json({
      success: true,
      message: 'Item removed successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a draft request to selected pharmacies
 * @route   POST /api/v1/requests/:requestId/submit
 * @access  Private (Customer only)
 */
const submitRequest = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId } = req.params;
    const { selectedPharmacyIds, customerLocation } = req.body;

    const request = await requestService.submitRequest(requestId, customerId, selectedPharmacyIds, customerLocation);
    
    res.status(200).json({
      success: true,
      message: 'Request submitted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all requests for a customer
 * @route   GET /api/v1/requests
 * @access  Private (Customer only)
 */
const getCustomerRequests = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { status, page, limit, sort } = req.query;

    const result = await requestService.getCustomerRequests(customerId, {
      status, page, limit, sort
    });
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a specific request for the logged-in customer
 * @route   GET /api/v1/requests/:requestId
 * @access  Private (Customer only)
 */
const getCustomerRequestById = catchAsync(async (req, res) => {
  const request = await requestService.getCustomerRequestById(req.params.requestId, req.user._id);
  res.status(200).json({
    success: true,
    data: request
  });
});

/**
 * @desc    Get all quotations for a request
 * @route   GET /api/v1/requests/:requestId/quotations
 * @access  Private (Customer only)
 */
const getRequestQuotations = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const customerId = req.user._id;

  const quotations = await quotationService.listCustomerQuotations(requestId, customerId);

  const formattedQuotations = quotations.map(q => {
    const formatted = { ...q.toObject() };
    if (formatted.total !== undefined) formatted.total = formatCentsToDollars(formatted.total);
    if (formatted.subtotal !== undefined) formatted.subtotal = formatCentsToDollars(formatted.subtotal);
    if (formatted.deliveryFee !== undefined) formatted.deliveryFee = formatCentsToDollars(formatted.deliveryFee);
    return formatted;
  });

  res.status(200).json({
    success: true,
    data: formattedQuotations
  });
});

/**
 * @desc    Get specific quotation details
 * @route   GET /api/v1/requests/:requestId/quotations/:quotationId
 * @access  Private (Customer only)
 */
const getQuotationDetails = catchAsync(async (req, res) => {
  const { quotationId } = req.params;
  const customerId = req.user._id;

  const quotation = await quotationService.getCustomerQuotationById(quotationId, customerId);

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
});

/**
 * @desc    Cancel a request
 * @route   POST /api/v1/requests/:requestId/cancel
 * @access  Private (Customer only)
 */
const cancelRequest = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await requestService.cancelCustomerRequest(requestId, customerId, reason);
    
    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a pharmacy quotation
 * @route   POST /api/v1/requests/:requestId/quotations/:quotationId/accept
 * @access  Private (Customer only)
 */
const acceptQuotation = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId, quotationId } = req.params;

    const request = await requestService.acceptQuotation(requestId, quotationId, customerId);
    
    res.status(200).json({
      success: true,
      message: 'Quotation accepted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Decline a pharmacy quotation
 * @route   POST /api/v1/requests/:requestId/quotations/:quotationId/decline
 * @access  Private (Customer only)
 */
const declineQuotation = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId, quotationId } = req.params;

    const request = await requestService.declineQuotation(requestId, quotationId, customerId);
    
    res.status(200).json({
      success: true,
      message: 'Quotation declined successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process payment for an accepted request
 * @route   POST /api/v1/requests/:requestId/pay
 * @access  Private (Customer only)
 */
const processPayment = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId } = req.params;
    const paymentDetails = req.body;

    const request = await requestService.processPaymentForRequest(requestId, customerId, paymentDetails);
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully. Request converted to order.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger expiration of old requests (Usually called via Cron)
 * @route   POST /api/v1/requests/system/expire
 * @access  Public (In production, protect with an API key or Admin role)
 */
const triggerExpiry = async (req, res, next) => {
  try {
    const expiredCount = await requestService.expireOldRequests();
    
    res.status(200).json({
      success: true,
      message: `Expired ${expiredCount} requests`,
      data: { expiredCount }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDraftRequest,
  addItemToRequest,
  updateRequestItem,
  removeRequestItem,
  submitRequest,
  getCustomerRequests,
  getCustomerRequestById,
  getRequestQuotations,
  getQuotationDetails,
  cancelRequest,
  acceptQuotation,
  declineQuotation,
  processPayment,
  triggerExpiry
};
