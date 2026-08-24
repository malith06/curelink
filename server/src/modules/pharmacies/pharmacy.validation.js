                                                 const { z } = require('zod');

const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required').trim(),
  line2: z.string().trim().optional().default(''),
  city: z.string().min(1, 'City is required').trim(),
  district: z.string().min(1, 'District is required').trim(),
  postalCode: z.string().trim().optional().default(''),
  country: z.string().min(1, 'Country is required').trim().default('Sri Lanka'),
});

const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180, 'Longitude must be at least -180').max(180, 'Longitude must be at most 180'),
    z.number().min(-90, 'Latitude must be at least -90').max(90, 'Latitude must be at most 90'),
  ]),
});

const openingHourSchema = z.object({
  isOpen: z.boolean().default(false),
  openTime: z.string().nullable().optional().default(null),
  closeTime: z.string().nullable().optional().default(null),
}).refine((data) => {
  if (data.isOpen) {
    if (!data.openTime || !data.closeTime) return false;
    if (data.closeTime <= data.openTime) return false;
  }
  return true;
}, {
  message: 'If open, both openTime and closeTime are required, and closeTime must be after openTime',
});

const createPharmacyProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name must be at most 150 characters').trim(),
  phone: z.string().min(1, 'Phone is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  address: addressSchema,
  openingHours: z.object({
    monday: openingHourSchema.optional(),
    tuesday: openingHourSchema.optional(),
    wednesday: openingHourSchema.optional(),
    thursday: openingHourSchema.optional(),
    friday: openingHourSchema.optional(),
    saturday: openingHourSchema.optional(),
    sunday: openingHourSchema.optional(),
  }).optional(),
  deliveryAvailable: z.boolean().optional().default(false),
  pickupAvailable: z.boolean().optional().default(true),
  serviceRadiusKm: z.number().min(1, 'Radius must be at least 1km').max(100, 'Radius must be at most 100km').optional().default(10),
  location: locationSchema.optional(),
});

const updatePharmacyProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name must be at most 150 characters').trim().optional(),
  phone: z.string().min(1, 'Phone is required').trim().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
  address: addressSchema.optional(),
  openingHours: z.object({
    monday: openingHourSchema.optional(),
    tuesday: openingHourSchema.optional(),
    wednesday: openingHourSchema.optional(),
    thursday: openingHourSchema.optional(),
    friday: openingHourSchema.optional(),
    saturday: openingHourSchema.optional(),
    sunday: openingHourSchema.optional(),
  }).optional(),
  deliveryAvailable: z.boolean().optional(),
  pickupAvailable: z.boolean().optional(),
  serviceRadiusKm: z.number().min(1, 'Radius must be at least 1km').max(100, 'Radius must be at most 100km').optional(),
  location: locationSchema.optional(),
});

module.exports = {
  createPharmacyProfileSchema,
  updatePharmacyProfileSchema,
};
