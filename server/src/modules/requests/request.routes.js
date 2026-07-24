const express = require('express');
const { protect, authorize } = require('../auth/auth.middleware');
const requestController = require('./request.controller');

const router = express.Router();

// All request routes require customer authentication
router.use(protect);
router.use(authorize('CUSTOMER'));

// Create draft request
router.post('/', requestController.createDraftRequest);

module.exports = router;
