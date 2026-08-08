const notificationService = require('./notification.service');
const ApiError = require('../../utils/ApiError');

/**
 * Get paginated notifications for the logged-in user
 */
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;

    const result = await notificationService.getUserNotifications(req.user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      isRead,
      type
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id, req.user.id);

    if (!notification) {
      return next(new ApiError('Notification not found or unauthorized', 404));
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
