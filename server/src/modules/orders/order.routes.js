const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate');
const {
  createOrderSchema,
  cancelOrderSchema,
  rejectOrderSchema,
  updateOrderStatusSchema
} = require('./order.validation');
const { ORDER_STATUS } = require('./order.constants');
const orderController = require('./order.controller');

const customerOrderRouter = express.Router();
const pharmacyOrderRouter = express.Router();

// ==========================================
// CUSTOMER ROUTES (/api/v1/orders)
// ==========================================
customerOrderRouter.use(protect);
customerOrderRouter.use(authorize('CUSTOMER'));

customerOrderRouter.post(
  '/from-quotation/:quotationId',
  validate(createOrderSchema),
  orderController.createOrder
);

customerOrderRouter.get('/my', orderController.getCustomerOrders);
customerOrderRouter.get('/:id', orderController.getOrderById);

customerOrderRouter.post(
  '/:id/cancel',
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

// Mount customer payment routes
const { customerPaymentRouter, pharmacyPaymentRouter } = require('../payments/payment.routes');
customerOrderRouter.use('/:orderId/payments', customerPaymentRouter);

// ==========================================
// PHARMACY ROUTES (/api/v1/pharmacy/orders)
// ==========================================
pharmacyOrderRouter.use(protect);
pharmacyOrderRouter.use(authorize('PHARMACY'));

pharmacyOrderRouter.get('/', orderController.getPharmacyOrders);
pharmacyOrderRouter.get('/:id', orderController.getOrderById);

pharmacyOrderRouter.post(
  '/:id/accept',
  (req, res, next) => {
    // Inject status into body to reuse update controller
    req.body = { status: ORDER_STATUS.PHARMACY_ACCEPTED };
    next();
  },
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

pharmacyOrderRouter.post(
  '/:id/reject',
  validate(rejectOrderSchema),
  orderController.rejectOrder
);

pharmacyOrderRouter.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// Mount pharmacy payment routes
pharmacyOrderRouter.use('/:orderId/payments', pharmacyPaymentRouter);

module.exports = {
  customerOrderRouter,
  pharmacyOrderRouter
};
