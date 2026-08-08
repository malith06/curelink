const Notification = require('./notification.model');
const { createNotificationPayload } = require('./notification.factory');
// Will import socketService later
// const socketService = require('../realtime/socket.service');

/**
 * Creates a notification in the DB and attempts real-time emission
 */
const createAndEmitNotification = async ({ type, recipient, entity, context = {}, session = null }) => {
  try {
    const payload = createNotificationPayload({ type, recipient, entity, context });

    // Check if duplicate event exists (sparse unique index will also catch it, 
    // but this is safe double-check if running without transaction sometimes)
    if (payload.eventKey) {
      const existing = await Notification.findOne({ eventKey: payload.eventKey }).session(session);
      if (existing) {
        return existing;
      }
    }

    const notificationOptions = session ? { session } : {};
    const [savedNotification] = await Notification.create([payload], notificationOptions);

    // Attempt Socket.io emission
    try {
      // We will integrate this in the realtime commit
      // if (socketService && socketService.emitToUser) {
      //   socketService.emitToUser(recipient._id.toString(), 'notification:new', savedNotification);
      // }
    } catch (emitError) {
      // Do not roll back transaction if socket emit fails
      console.error('Failed to emit real-time notification:', emitError);
    }

    return savedNotification;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error, gracefully ignore and return existing if it was an eventKey collision
      console.log(`Duplicate notification prevented for eventKey: ${error.keyValue.eventKey}`);
      return null;
    }
    throw error;
  }
};

/**
 * Get paginated notifications for a user
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, isRead, type }) => {
  const query = { recipientUserId: userId };
  
  if (isRead !== undefined) {
    query.isRead = isRead === 'true' || isRead === true;
  }
  
  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    recipientUserId: userId,
    isRead: false
  });
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientUserId: userId },
    { 
      isRead: true,
      readAt: new Date()
    },
    { new: true } // Mongoose warning notes to use returnDocument: 'after' ideally, new: true works
  );
  
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipientUserId: userId, isRead: false },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
  
  return result.modifiedCount;
};

module.exports = {
  createAndEmitNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
