const { z } = require('zod');
const { ALLOWED_RANGES, DEFAULT_RANGE } = require('./dashboard.constants');

const dashboardRangeSchema = z.object({
  query: z.object({
    range: z.enum(ALLOWED_RANGES).default(DEFAULT_RANGE),
  }),
});

module.exports = {
  dashboardRangeSchema,
};
