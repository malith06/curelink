const { z } = require('zod');
const { MIN_PREPARATION_MINUTES, MAX_PREPARATION_MINUTES } = require('./quotation.constants');

const quotationItemUpdateSchema = z.object({
  requestItemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid request item ID'),
  availableQuantity: z.number().int().min(0).optional(),
  unitPrice: z.number().min(0).optional().nullable(), // Frontend sends standard decimal (e.g. 10.50), backend converts to cents
  substitutionOffered: z.boolean().optional(),
  substitutionMedicineId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid medicine ID').optional().nullable(),
  substitutionNote: z.string().max(300).optional().nullable(),
  pharmacyItemNote: z.string().max(300).optional().nullable()
});

const updateDraftQuotationSchema = z.object({
  body: z.object({
    items: z.array(quotationItemUpdateSchema).optional(),
    deliveryFee: z.number().min(0).optional(),
    preparationMinutes: z.number().int().min(MIN_PREPARATION_MINUTES).max(MAX_PREPARATION_MINUTES).optional(),
    deliveryAvailable: z.boolean().optional(),
    pickupAvailable: z.boolean().optional(),
    expiresAt: z.string().datetime().optional(), // ISO string
    pharmacyNotes: z.string().max(500).optional()
  })
});

module.exports = {
  updateDraftQuotationSchema
};
