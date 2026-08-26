const Order = require('../orders/order.model');
const ApiError = require('../../utils/ApiError');

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/v1/admin/orders
 * @access  Private (Admin)
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { status, paymentStatus } = req.query;

    const query = {};
    if (status) {
      if (status === 'PENDING') {
        query.orderStatus = { $in: ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED'] };
      } else if (status === 'PROCESSING') {
        query.orderStatus = { $in: ['PHARMACY_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] };
      } else if (status === 'COMPLETED') {
        query.orderStatus = { $in: ['DELIVERED', 'COMPLETED'] };
      } else if (status === 'CANCELLED') {
        query.orderStatus = { $in: ['CANCELLED', 'REJECTED'] };
      } else {
        query.orderStatus = status;
      }
    }
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'fullName email phone')
        .populate('pharmacyId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
