const { z } = require('zod');

const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    brand: z.string().min(2, 'Brand is required'),
    category: z.string().min(2, 'Category is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    prescriptionRequired: z.boolean().optional(),
    manufacturer: z.string().min(2, 'Manufacturer is required'),
    imageUrl: z.string().url('Invalid URL').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

const updateMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').optional(),
    brand: z.string().min(2, 'Brand is required').optional(),
    category: z.string().min(2, 'Category is required').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    prescriptionRequired: z.boolean().optional(),
    manufacturer: z.string().min(2, 'Manufacturer is required').optional(),
    imageUrl: z.string().url('Invalid URL').optional().nullable(),
    isActive: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be updated',
  }),
});

module.exports = {
  createMedicineSchema,
  updateMedicineSchema,
};
