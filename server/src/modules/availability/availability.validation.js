const { z } = require('zod');
const { AVAILABILITY_STATUS_ARRAY } = require('./availability.constants');

const updateAvailabilitySchema = z.object({
  status: z.enum(AVAILABILITY_STATUS_ARRAY, {
    errorMap: () => ({ message: `Status must be one of: ${AVAILABILITY_STATUS_ARRAY.join(', ')}` }),
  }),
  notes: z.string().max(200, 'Notes must be at most 200 characters').trim().optional(),
});

module.exports = {
  updateAvailabilitySchema,
};
