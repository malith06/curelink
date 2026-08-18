const User = require('../users/user.model');
const Pharmacy = require('../pharmacies/pharmacy.model');
const Order = require('../orders/order.model');
const PaymentEvent = require('../payment-events/paymentEvent.model');
const Prescription = require('../prescriptions/prescription.model');
const MedicineRequest = require('../requests/request.model');
const { ROLES } = require('../users/user.constants');
const { PHARMACY_VERIFICATION_STATUS } = require('../pharmacies/pharmacy.constants');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../orders/order.constants');
const { RECENT_ITEMS_LIMIT } = require('./dashboard.constants');

const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAYMENT_CONFIRMED,
  ORDER_STATUS.PHARMACY_ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

exports.getAdminDashboard = async (rangeDays = 30) => {
  const dateRange = new Date();
  dateRange.setDate(dateRange.getDate() - rangeDays);

  // 1. Summaries
  const totalCustomers = await User.countDocuments({ role: ROLES.CUSTOMER });
  const totalPharmacies = await Pharmacy.countDocuments({});
  const approvedPharmacies = await Pharmacy.countDocuments({ verificationStatus: PHARMACY_VERIFICATION_STATUS.APPROVED });
  const pendingPharmacyApprovals = await Pharmacy.countDocuments({ verificationStatus: PHARMACY_VERIFICATION_STATUS.PENDING });
  
  const totalOrders = await Order.countDocuments({});
  const activeOrders = await Order.countDocuments({ orderStatus: { $in: ACTIVE_ORDER_STATUSES } });
  const completedOrders = await Order.countDocuments({ orderStatus: ORDER_STATUS.COMPLETED });

  const totalPaymentsAgg = await Order.aggregate([
    { $match: { paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.COD_COLLECTED] } } },
    { $group: { _id: null, totalValue: { $sum: '$total' } } }
  ]);
  const totalPayments = totalPaymentsAgg.length > 0 ? totalPaymentsAgg[0].totalValue : 0;

  const failedPayments = await PaymentEvent.countDocuments({ status: 'FAILED', createdAt: { $gte: dateRange } }); // status enum inside payment gateway webhook

  const ocrFailures = await Prescription.countDocuments({ ocrStatus: 'FAILED', createdAt: { $gte: dateRange } }); // OCR_STATUSES.FAILED

  // 2. Pending Pharmacies
  const pendingPharmacies = await Pharmacy.find({ verificationStatus: PHARMACY_VERIFICATION_STATUS.PENDING })
    .sort({ createdAt: 1 })
    .limit(RECENT_ITEMS_LIMIT)
    .select('name licenseNumber contactEmail phone createdAt');

  // 3. Popular Medicines
  const popularMedicinesAgg = await MedicineRequest.aggregate([
    { $match: { createdAt: { $gte: dateRange } } },
    { $unwind: '$items' },
    { $group: {
        _id: { $cond: [{ $ifNull: ['$items.medicineId', false] }, '$items.medicineId', '$items.genericName'] },
        count: { $sum: '$items.quantity' },
        name: { $first: '$items.genericName' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Format popular medicines
  const popularMedicines = popularMedicinesAgg.map(m => ({
    name: m.name,
    count: m.count,
  }));

  // 4. Charts
  const ordersByStatusAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: dateRange } } },
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);
  const ordersByStatus = ordersByStatusAgg.map(o => ({ label: o._id, value: o.count }));

  const paymentsByStatusAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: dateRange } } },
    { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
  ]);
  const paymentsByStatus = paymentsByStatusAgg.map(p => ({ label: p._id, value: p.count }));

  const paymentsByMethodAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: dateRange } } },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
  ]);
  const paymentsByMethod = paymentsByMethodAgg.map(p => ({ label: p._id, value: p.count }));

  const ocrOutcomesAgg = await Prescription.aggregate([
    { $match: { createdAt: { $gte: dateRange } } },
    { $group: { _id: '$ocrStatus', count: { $sum: 1 } } }
  ]);
  const ocrOutcomes = ocrOutcomesAgg.map(o => ({ label: o._id, value: o.count }));

  return {
    summary: {
      totalCustomers,
      totalPharmacies,
      approvedPharmacies,
      pendingPharmacyApprovals,
      totalOrders,
      activeOrders,
      completedOrders,
      totalPayments,
      failedPayments,
      ocrFailures,
    },
    pendingPharmacies,
    popularMedicines,
    charts: {
      ordersByStatus,
      paymentsByStatus,
      paymentsByMethod,
      ocrOutcomes,
    }
  };
};
