const mongoose = require('mongoose');
const MedicineRequest = require('../requests/request.model');
const Quotation = require('../quotations/quotation.model');
const Order = require('../orders/order.model');
const { REQUEST_STATUS } = require('../requests/request.constants');
const { QUOTATION_STATUS } = require('../quotations/quotation.constants');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../orders/order.constants');
const { RECENT_ITEMS_LIMIT } = require('./dashboard.constants');

const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PAYMENT_CONFIRMED,
  ORDER_STATUS.PHARMACY_ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
]; // PENDING_PAYMENT might be active but blocked, let's include it in active count as per prompt if needed, or keep it simple.
// Prompt 18: Include current pharmacy's orders in active statuses: PAYMENT_CONFIRMED, PHARMACY_ACCEPTED, PREPARING, READY_FOR_PICKUP, OUT_FOR_DELIVERY, DELIVERED. Exclude COMPLETED, CANCELLED, REJECTED. PENDING_PAYMENT may be shown separately...

exports.getPharmacyDashboard = async (pharmacyId, rangeDays = 30) => {
  const pharmacyObjectId = new mongoose.Types.ObjectId(pharmacyId);
  const dateRange = new Date();
  dateRange.setDate(dateRange.getDate() - rangeDays);

  // 1. Summary Counts
  const incomingRequestsCount = await MedicineRequest.countDocuments({
    selectedPharmacyIds: pharmacyObjectId,
    status: { $in: [REQUEST_STATUS.SUBMITTED, REQUEST_STATUS.QUOTATIONS_RECEIVED] },
  });

  const submittedQuotationsCount = await Quotation.countDocuments({
    pharmacyId: pharmacyObjectId,
    status: { $in: [QUOTATION_STATUS.SUBMITTED, QUOTATION_STATUS.ACCEPTED, QUOTATION_STATUS.CLOSED] },
  });

  const activeOrdersCount = await Order.countDocuments({
    pharmacyId: pharmacyObjectId,
    orderStatus: { $in: [...ACTIVE_ORDER_STATUSES, ORDER_STATUS.PENDING_PAYMENT] },
  });

  const completedOrdersCount = await Order.countDocuments({
    pharmacyId: pharmacyObjectId,
    orderStatus: ORDER_STATUS.COMPLETED,
  });

  // 2. Gross Fulfilled Order Value
  const grossFulfilledAgg = await Order.aggregate([
    {
      $match: {
        pharmacyId: pharmacyObjectId,
        orderStatus: ORDER_STATUS.COMPLETED,
        paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.COD_COLLECTED] },
      },
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$total' },
      },
    },
  ]);
  const grossFulfilledOrderValue = grossFulfilledAgg.length > 0 ? parseFloat((grossFulfilledAgg[0].totalValue / 100).toFixed(2)) : 0;

  // 3. Average Response Time
  const responseTimeAgg = await Quotation.aggregate([
    {
      $match: {
        pharmacyId: pharmacyObjectId,
        status: { $in: [QUOTATION_STATUS.SUBMITTED, QUOTATION_STATUS.ACCEPTED, QUOTATION_STATUS.CLOSED] },
        submittedAt: { $exists: true, $type: 'date' },
      },
    },
    {
      $lookup: {
        from: 'medicinerequests',
        localField: 'requestId',
        foreignField: '_id',
        as: 'request',
      },
    },
    {
      $unwind: '$request',
    },
    {
      $match: {
        'request.submittedAt': { $exists: true, $type: 'date' },
      },
    },
    {
      $project: {
        diffInMs: { $subtract: ['$submittedAt', '$request.submittedAt'] },
      },
    },
    {
      $match: {
        diffInMs: { $gte: 0 },
      },
    },
    {
      $group: {
        _id: null,
        avgMs: { $avg: '$diffInMs' },
      },
    },
  ]);
  const averageResponseMinutes =
    responseTimeAgg.length > 0 ? Math.round(responseTimeAgg[0].avgMs / 60000) : null;

  // 4. Recent Lists
  const incomingRequests = await MedicineRequest.find({
    selectedPharmacyIds: pharmacyObjectId,
    status: { $in: [REQUEST_STATUS.SUBMITTED, REQUEST_STATUS.QUOTATIONS_RECEIVED] },
  })
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('requestNumber medicineCount requiresPrescription prescriptionVerificationStatus submittedAt expiresAt');

  const activeOrders = await Order.find({
    pharmacyId: pharmacyObjectId,
    orderStatus: { $in: [...ACTIVE_ORDER_STATUSES, ORDER_STATUS.PENDING_PAYMENT] },
  })
    .populate('customerId', 'name')
    .sort({ createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('orderNumber customerId orderStatus paymentStatus fulfilmentMethod total currency createdAt');

  const recentQuotations = await Quotation.find({
    pharmacyId: pharmacyObjectId,
  })
    .populate('requestId', 'requestNumber')
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('quotationNumber status total currency submittedAt expiresAt');

  // Format arrays safely
  const formattedOrders = activeOrders.map((o) => ({
    _id: o._id,
    id: o._id,
    orderNumber: o.orderNumber,
    safeCustomerName: o.customerId?.name || 'Customer',
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    fulfilmentMethod: o.fulfilmentMethod,
    total: o.total ? parseFloat((o.total / 100).toFixed(2)) : 0,
    currency: o.currency,
    createdAt: o.createdAt,
  }));

  const formattedQuotations = recentQuotations.map((q) => ({
    _id: q._id,
    id: q._id,
    quotationNumber: q.quotationNumber,
    requestNumber: q.requestId?.requestNumber,
    status: q.status,
    total: q.total ? parseFloat((q.total / 100).toFixed(2)) : 0,
    currency: q.currency,
    submittedAt: q.submittedAt,
    expiresAt: q.expiresAt,
  }));

  const formattedRequests = incomingRequests.map((r) => ({
    _id: r._id,
    id: r._id,
    requestId: r._id,
    requestNumber: r.requestNumber,
    medicineCount: r.medicineCount,
    requiresPrescription: r.requiresPrescription,
    prescriptionVerificationStatus: r.prescriptionVerificationStatus,
    submittedAt: r.submittedAt,
    expiresAt: r.expiresAt,
  }));

  // 5. Chart Data
  const ordersByStatusAgg = await Order.aggregate([
    {
      $match: {
        pharmacyId: pharmacyObjectId,
        createdAt: { $gte: dateRange },
      },
    },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  const ordersByStatus = ordersByStatusAgg.map((o) => ({
    label: o._id,
    value: o.count,
  }));

  const fulfilledValueTrendAgg = await Order.aggregate([
    {
      $match: {
        pharmacyId: pharmacyObjectId,
        orderStatus: ORDER_STATUS.COMPLETED,
        paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.COD_COLLECTED] },
        createdAt: { $gte: dateRange },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        value: { $sum: '$total' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const fulfilledValueTrend = fulfilledValueTrendAgg.map((o) => ({
    date: o._id,
    value: o.value ? parseFloat((o.value / 100).toFixed(2)) : 0,
  }));

  return {
    summary: {
      incomingRequests: incomingRequestsCount,
      submittedQuotations: submittedQuotationsCount,
      activeOrders: activeOrdersCount,
      completedOrders: completedOrdersCount,
      grossFulfilledOrderValue,
      averageResponseMinutes,
    },
    incomingRequests: formattedRequests,
    activeOrders: formattedOrders,
    recentQuotations: formattedQuotations,
    charts: {
      ordersByStatus,
      fulfilledValueTrend,
    },
  };
};
