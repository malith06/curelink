const { z } = require('zod');
const { ALLOWED_RANGES, DEFAULT_RANGE } = require('./dashboard.constants');

const dashboardRangeSchema = z.object({
  query: z.object({
    range: z.enum(ALLOWED_RANGES).default(DEFAULT_RANGE),
  }),
});

const reportDateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid startDate format',
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid endDate format',
    }),
  }),
});

module.exports = {
  dashboardRangeSchema,
  reportDateRangeSchema,
};
