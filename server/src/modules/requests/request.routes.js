const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate');
const requestController = require('./request.controller');
const { addItemSchema } = require('./request.validation');

const router = express.Router();

// All request routes require customer authentication
router.use(protect);
router.use(authorize('CUSTOMER'));

// Create draft request
router.post('/', requestController.createDraftRequest);

// Add item to draft request
router.post(
  '/:requestId/items',
  validate(addItemSchema),
  requestController.addItemToRequest
);

module.exports = router;
