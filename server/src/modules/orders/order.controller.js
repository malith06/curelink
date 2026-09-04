const catchAsync = require('../../utils/asyncHandler');
const orderService = require('./order.service');
const ApiError = require('../../utils/ApiError');
const { formatCentsToDollars } = require('../quotations/quotation.calculator');

const createOrder = catchAsync(async (req, res) => {
  const { quotationId } = req.params;
  const customerId = req.user._id;

  const order = await orderService.createOrderFromQuotation(customerId, quotationId, req.body);

  const formatted = { ...order.toObject() };
  if (formatted.total !== undefined) formatted.total = formatCentsToDollars(formatted.total);
  if (formatted.subtotal !== undefined) formatted.subtotal = formatCentsToDollars(formatted.subtotal);
  if (formatted.deliveryFee !== undefined) formatted.deliveryFee = formatCentsToDollars(formatted.deliveryFee);
  if (formatted.items) {
    formatted.items = formatted.items.map(item => {
      if (item.unitPrice !== undefined) item.unitPrice = formatCentsToDollars(item.unitPrice);
      if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
      return item;
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      order: formatted
    }
  });
});

const getCustomerOrders = catchAsync(async (req, res) => {
  const customerId = req.user._id;
  const orders = await orderService.getCustomerOrders(customerId, req.query);

  const formattedOrders = orders.map(order => {
    const formatted = { ...order.toObject() };
    if (formatted.total !== undefined) formatted.total = formatCentsToDollars(formatted.total);
    if (formatted.subtotal !== undefined) formatted.subtotal = formatCentsToDollars(formatted.subtotal);
    if (formatted.deliveryFee !== undefined) formatted.deliveryFee = formatCentsToDollars(formatted.deliveryFee);
    if (formatted.items) {
      formatted.items = formatted.items.map(item => {
        if (item.unitPrice !== undefined) item.unitPrice = formatCentsToDollars(item.unitPrice);
        if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
        return item;
      });
    }
    return formatted;
  });

  res.status(200).json({
    status: 'success',
    results: formattedOrders.length,
    data: {
      orders: formattedOrders
    }
  });
});

const getPharmacyOrders = catchAsync(async (req, res) => {
  const Pharmacy = require('../pharmacies/pharmacy.model');
  const pharmacy = await Pharmacy.findOne({ ownerUserId: req.user._id }).lean();
  if (!pharmacy) throw new ApiError('Pharmacy profile not found', 404);
  
  const orders = await orderService.getPharmacyOrders(pharmacy._id, req.query);

  const formattedOrders = orders.map(order => {
    const formatted = { ...order.toObject() };
    if (formatted.total !== undefined) formatted.total = formatCentsToDollars(formatted.total);
    if (formatted.subtotal !== undefined) formatted.subtotal = formatCentsToDollars(formatted.subtotal);
    if (formatted.deliveryFee !== undefined) formatted.deliveryFee = formatCentsToDollars(formatted.deliveryFee);
    if (formatted.items) {
      formatted.items = formatted.items.map(item => {
        if (item.unitPrice !== undefined) item.unitPrice = formatCentsToDollars(item.unitPrice);
        if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
        return item;
      });
    }
    return formatted;
  });

  res.status(200).json({
    status: 'success',
    results: formattedOrders.length,
    data: {
      orders: formattedOrders
    }
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  let entityId = req.user._id;
  const userRole = req.user.role; // CUSTOMER or PHARMACY
  
  if (userRole === 'PHARMACY') {
    const Pharmacy = require('../pharmacies/pharmacy.model');
    const pharmacy = await Pharmacy.findOne({ ownerUserId: req.user._id }).lean();
    if (pharmacy) {
      entityId = pharmacy._id;
    }
  }

  const order = await orderService.getOrderById(id, entityId, userRole);

  const formatted = { ...order.toObject() };
  if (formatted.total !== undefined) formatted.total = formatCentsToDollars(formatted.total);
  if (formatted.subtotal !== undefined) formatted.subtotal = formatCentsToDollars(formatted.subtotal);
  if (formatted.deliveryFee !== undefined) formatted.deliveryFee = formatCentsToDollars(formatted.deliveryFee);
  if (formatted.items) {
    formatted.items = formatted.items.map(item => {
      if (item.unitPrice !== undefined) item.unitPrice = formatCentsToDollars(item.unitPrice);
      if (item.subtotal !== undefined) item.subtotal = formatCentsToDollars(item.subtotal);
      return item;
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: formatted
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
  const Pharmacy = require('../pharmacies/pharmacy.model');
  const pharmacy = await Pharmacy.findOne({ ownerUserId: req.user._id }).lean();
  if (!pharmacy) throw new ApiError('Pharmacy profile not found', 404);
  
  const pharmacyId = pharmacy._id;
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
  const Pharmacy = require('../pharmacies/pharmacy.model');
  const pharmacy = await Pharmacy.findOne({ ownerUserId: req.user._id }).lean();
  if (!pharmacy) throw new ApiError('Pharmacy profile not found', 404);
  
  const pharmacyId = pharmacy._id;
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
