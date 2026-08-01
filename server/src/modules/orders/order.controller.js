const catchAsync = require('../../utils/asyncHandler');
const orderService = require('./order.service');

const createOrder = catchAsync(async (req, res) => {
  const { quotationId } = req.params;
  const customerId = req.user._id;

  const order = await orderService.createOrderFromQuotation(customerId, quotationId, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

const getCustomerOrders = catchAsync(async (req, res) => {
  const customerId = req.user._id;
  const orders = await orderService.getCustomerOrders(customerId, req.query);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

const getPharmacyOrders = catchAsync(async (req, res) => {
  const pharmacyId = req.user._id; // Assuming pharmacy is logged in
  const orders = await orderService.getPharmacyOrders(pharmacyId, req.query);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role; // CUSTOMER or PHARMACY

  const order = await orderService.getOrderById(id, userId, userRole);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

const cancelOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const customerId = req.user._id;
  const { reason } = req.body;

  const order = await orderService.cancelOrder(id, customerId, reason);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

const rejectOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const pharmacyId = req.user._id;
  const { reason } = req.body;

  const order = await orderService.rejectOrder(id, pharmacyId, reason);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const pharmacyId = req.user._id;
  const { status, note } = req.body;

  const order = await orderService.updateOrderStatus(id, pharmacyId, status, note);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

module.exports = {
  createOrder,
  getCustomerOrders,
  getPharmacyOrders,
  getOrderById,
  cancelOrder,
  rejectOrder,
  updateOrderStatus
};
