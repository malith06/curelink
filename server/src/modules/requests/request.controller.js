const requestService = require('./request.service');

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
 * @desc    Get all requests for the logged-in customer
 * @route   GET /api/v1/requests
 * @access  Private (Customer only)
 */
const getCustomerRequests = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { status } = req.query;

    const requests = await requestService.getCustomerRequests(customerId, { status });
    
    res.status(200).json({
      success: true,
      data: requests
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
const getCustomerRequestById = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId } = req.params;

    const request = await requestService.getCustomerRequestById(requestId, customerId);
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

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

module.exports = {
  createDraftRequest,
  addItemToRequest,
  updateRequestItem,
  removeRequestItem,
  submitRequest,
  getCustomerRequests,
  getCustomerRequestById,
  cancelRequest
};
