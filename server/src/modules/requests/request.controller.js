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

module.exports = {
  createDraftRequest,
  addItemToRequest
};
