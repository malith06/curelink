const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const {
  getNotificationsQuerySchema,
  markNotificationReadParamsSchema
} = require('./notification.validation');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('./notification.controller');

const validateRequest = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = validated.body;
    req.query = validated.query;
    req.params = validated.params;
    next();
  } catch (error) {
    next(error);
  }
};

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// GET /api/v1/notifications
router.get('/', validateRequest(getNotificationsQuerySchema), getNotifications);

// GET /api/v1/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', markAllAsRead);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', validateRequest(markNotificationReadParamsSchema), markAsRead);

module.exports = router;
