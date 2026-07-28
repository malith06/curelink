const express = require('express');
const router = express.Router();
const quotationController = require('./quotation.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { updateDraftSchema } = require('./quotation.validation');

// All routes here require authentication and pharmacy role for now
// (Customer facing routes will be handled separately or added here later with different restrictions)
router.use(protect);

// Pharmacy routes
router.use(restrictTo('pharmacy'));

// Create or get draft for a specific request
router.post('/requests/:requestId/draft', quotationController.getOrCreateDraft);

// List all quotations for the logged-in pharmacy
router.get('/', quotationController.listPharmacyQuotations);

// Get a specific quotation
router.get('/:quotationId', quotationController.getQuotation);

// Update a draft quotation
router.patch('/:quotationId/draft', validate(updateDraftSchema), quotationController.updateDraft);

// Submit a quotation
router.post('/:quotationId/submit', quotationController.submitQuotation);

module.exports = router;
