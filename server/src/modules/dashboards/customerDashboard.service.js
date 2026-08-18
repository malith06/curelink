const MedicineRequest = require('../requests/request.model');
const Quotation = require('../quotations/quotation.model');
const Order = require('../orders/order.model');
const Prescription = require('../prescriptions/prescription.model');
const Notification = require('../notifications/notification.model');
const { REQUEST_STATUS } = require('../requests/request.constants');
const { QUOTATION_STATUS } = require('../quotations/quotation.constants');
const { ORDER_STATUS } = require('../orders/order.constants');
const { RECENT_ITEMS_LIMIT } = require('./dashboard.constants');

const ACTIVE_REQUEST_STATUSES = [
  REQUEST_STATUS.SUBMITTED,
  REQUEST_STATUS.QUOTATIONS_RECEIVED,
  REQUEST_STATUS.QUOTATION_ACCEPTED,
];

const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAYMENT_CONFIRMED,
  ORDER_STATUS.PHARMACY_ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

exports.getCustomerDashboard = async (customerId) => {
  // 1. Summary aggregations
  const activeRequestsCount = await MedicineRequest.countDocuments({
    customerId,
    status: { $in: ACTIVE_REQUEST_STATUSES },
  });

  const quotationsReceivedCount = await Quotation.countDocuments({
    customerId,
    status: { $in: [QUOTATION_STATUS.SUBMITTED, QUOTATION_STATUS.ACCEPTED] },
  });

  const activeOrdersCount = await Order.countDocuments({
    customerId,
    orderStatus: { $in: ACTIVE_ORDER_STATUSES },
  });

  const recentPrescriptionsCount = await Prescription.countDocuments({ customerId });

  const unreadNotificationsCount = await Notification.countDocuments({
    recipientUserId: customerId,
    isRead: false,
  });

  // 2. Recent lists
  const activeRequests = await MedicineRequest.find({
    customerId,
    status: { $in: ACTIVE_REQUEST_STATUSES },
  })
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('requestNumber status medicineCount selectedPharmacyCount requiresPrescription quotationCount submittedAt expiresAt');

  const recentQuotations = await Quotation.find({
    customerId,
    status: { $in: [QUOTATION_STATUS.SUBMITTED, QUOTATION_STATUS.ACCEPTED] },
  })
    .populate('pharmacyId', 'name')
    .populate('requestId', 'requestNumber')
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('quotationNumber coveragePercentage total currency expiresAt status');

  const activeOrders = await Order.find({
    customerId,
    orderStatus: { $in: ACTIVE_ORDER_STATUSES },
  })
    .populate('pharmacyId', 'name')
    .sort({ createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('orderNumber orderStatus paymentStatus fulfilmentMethod total currency createdAt');

  const recentPrescriptions = await Prescription.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('requestId uploadStatus ocrStatus customerReviewStatus createdAt');

  const recentNotifications = await Notification.find({ recipientUserId: customerId })
    .sort({ createdAt: -1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('type title message actionUrl isRead createdAt');

  // Format quotations array
  const formattedQuotations = recentQuotations.map((q) => ({
    _id: q._id,
    id: q._id,
    quotationNumber: q.quotationNumber,
    requestNumber: q.requestId?.requestNumber,
    requestId: q.requestId?._id,
    pharmacyName: q.pharmacyId?.name,
    coveragePercentage: q.coveragePercentage,
    total: q.total,
    currency: q.currency,
    expiresAt: q.expiresAt,
    status: q.status,
  }));

  // Format orders array
  const formattedOrders = activeOrders.map((o) => ({
    _id: o._id,
    id: o._id,
    orderNumber: o.orderNumber,
    pharmacyName: o.pharmacyId?.name,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    fulfilmentMethod: o.fulfilmentMethod,
    total: o.total,
    currency: o.currency,
    createdAt: o.createdAt,
  }));

  return {
    summary: {
      activeRequests: activeRequestsCount,
      quotationsReceived: quotationsReceivedCount,
      activeOrders: activeOrdersCount,
      recentPrescriptions: Math.min(recentPrescriptionsCount, RECENT_ITEMS_LIMIT), // As per instructions "Latest N records", but showing count of recent
      unreadNotifications: unreadNotificationsCount,
    },
    activeRequests,
    recentQuotations: formattedQuotations,
    activeOrders: formattedOrders,
    recentPrescriptions,
    recentNotifications,
  };
};
