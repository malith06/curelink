const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const adminOrderController = require('./admin.order.controller');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', adminOrderController.getAllOrders);

module.exports = router;
