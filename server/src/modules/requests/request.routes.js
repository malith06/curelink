const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate');
const requestController = require('./request.controller');
const { addItemSchema, updateItemSchema, submitRequestSchema, processPaymentSchema } = require('./request.validation');
const prescriptionUploadMiddleware = require('../../middleware/prescriptionUpload');
const prescriptionController = require('../prescriptions/prescription.controller');

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

// Cancel request
router.post(
  '/:requestId/cancel',
  requestController.cancelRequest
);

// Get quotations for request
router.get(
  '/:requestId/quotations',
  requestController.getRequestQuotations
);

// Get specific quotation details
router.get(
  '/:requestId/quotations/:quotationId',
  requestController.getQuotationDetails
);

// Accept quotation
router.post(
  '/:requestId/quotations/:quotationId/accept',
  requestController.acceptQuotation
);

// Decline quotation
router.post(
  '/:requestId/quotations/:quotationId/decline',
  requestController.declineQuotation
);

// Process payment
router.post(
  '/:requestId/pay',
  validate(processPaymentSchema),
  requestController.processPayment
);

// Trigger expiry cron job manually
router.post(
  '/system/expire',
  requestController.triggerExpiry
);

// Upload prescription for request
router.post(
  '/:requestId/prescription',
  prescriptionUploadMiddleware,
  prescriptionController.uploadPrescription
);

module.exports = router;
