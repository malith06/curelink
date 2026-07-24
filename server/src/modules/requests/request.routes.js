const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate');
const requestController = require('./request.controller');
const { addItemSchema, updateItemSchema, submitRequestSchema } = require('./request.validation');

const router = express.Router();

// All request routes require customer authentication
router.use(protect);
router.use(authorize('CUSTOMER'));

// Get all requests for customer
router.get('/', requestController.getCustomerRequests);

// Get specific request details
router.get('/:requestId', requestController.getCustomerRequestById);

// Create draft request
router.post('/', requestController.createDraftRequest);

// Add item to draft request
router.post(
  '/:requestId/items',
  validate(addItemSchema),
  requestController.addItemToRequest
);

// Update item in draft request
router.patch(
  '/:requestId/items/:medicineId',
  validate(updateItemSchema),
  requestController.updateRequestItem
);

// Remove item from draft request
router.delete(
  '/:requestId/items/:medicineId',
  requestController.removeRequestItem
);

// Submit request
router.post(
  '/:requestId/submit',
  validate(submitRequestSchema),
  requestController.submitRequest
);

module.exports = router;
