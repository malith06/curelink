const { z } = require('zod');
const { AVAILABILITY_STATUS_ARRAY } = require('./availability.constants');

const updateAvailabilitySchema = z.object({
  status: z.enum(AVAILABILITY_STATUS_ARRAY, {
    errorMap: () => ({ message: `Status must be one of: ${AVAILABILITY_STATUS_ARRAY.join(', ')}` }),
  }).optional(),
  notes: z.string().max(200, 'Notes must be at most 200 characters').trim().optional(),
  price: z.number().min(0, 'Price must be non-negative').optional().nullable(),
  stockQuantity: z.number().min(0, 'Stock must be non-negative').optional().nullable(),
  dosage: z.string().max(100, 'Dosage must be at most 100 characters').trim().optional(),
  isManualOverride: z.boolean().optional(),
});

module.exports = {
  updateAvailabilitySchema,
};
