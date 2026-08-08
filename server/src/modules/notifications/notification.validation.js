const { z } = require('zod');
const { NOTIFICATION_EVENTS } = require('./notification.constants');

const getNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    isRead: z.enum(['true', 'false']).optional(),
    type: z.enum(Object.values(NOTIFICATION_EVENTS)).optional()
  })
});

const markNotificationReadParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID')
  })
});

module.exports = {
  getNotificationsQuerySchema,
  markNotificationReadParamsSchema
};
