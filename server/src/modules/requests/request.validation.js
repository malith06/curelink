const { z } = require('zod');
const { REQUEST_UNITS, MEDICINE_SOURCE } = require('./request.constants');

const addItemSchema = z.object({
  medicineId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid medicine ID format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100').default(1),
  unit: z.enum(Object.values(REQUEST_UNITS)).default(REQUEST_UNITS.UNIT),
  notes: z.string().trim().max(300, 'Notes must be at most 300 characters').optional(),
  source: z.enum(Object.values(MEDICINE_SOURCE)).default(MEDICINE_SOURCE.MANUAL_SEARCH)
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(100).optional(),
  notes: z.string().trim().max(300).optional()
});

const submitRequestSchema = z.object({
  selectedPharmacyIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1, 'Must select at least one pharmacy')
    .max(5, 'Cannot select more than 5 pharmacies'),
  customerLocation: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)    // latitude
    ])
  })
});

const provideQuotationSchema = z.object({
  items: z.array(z.object({
    requestItemId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    availabilityStatus: z.enum(['AVAILABLE', 'PARTIALLY_AVAILABLE', 'UNAVAILABLE', 'SUBSTITUTE_AVAILABLE']),
    availableQuantity: z.number().int().min(0),
    unitPrice: z.number().min(0)
  })).min(1, 'Must provide at least one item quotation'),
  notes: z.string().max(500).optional()
});

const updateRequestStatusSchema = z.object({
  status: z.enum([
    'CONVERTED_TO_ORDER',
    'PROCESSING',
    'READY_FOR_PICKUP',
    'DISPATCHED',
    'COMPLETED',
    'CANCELLED'
  ])
});

const processPaymentSchema = z.object({
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  amount: z.number().optional()
});

module.exports = {
  addItemSchema,
  updateItemSchema,
  submitRequestSchema,
  provideQuotationSchema,
  updateRequestStatusSchema,
  processPaymentSchema
};
