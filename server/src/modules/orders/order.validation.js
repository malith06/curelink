const { z } = require('zod');
const { FULFILMENT_METHOD, ORDER_STATUS } = require('./order.constants');

const deliveryAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().min(9, 'Valid phone number required').max(20),
  line1: z.string().min(5, 'Address line 1 is required').max(150),
  line2: z.string().max(150).optional(),
  city: z.string().min(2, 'City is required').max(100),
  district: z.string().min(2, 'District is required').max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(2, 'Country is required').max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

const createOrderSchema = z.object({
  body: z.object({
    fulfilmentMethod: z.enum(Object.values(FULFILMENT_METHOD)),
    deliveryAddress: deliveryAddressSchema.optional(),
    deliveryInstructions: z.string().max(500).optional()
  }).refine((data) => {
    if (data.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && !data.deliveryAddress) {
      return false;
    }
    return true;
  }, {
    message: 'Delivery address is required when fulfilment method is DELIVERY',
    path: ['deliveryAddress']
  })
});

const cancelOrderSchema = z.object({
  body: z.object({
    reason: z.string().max(300, 'Reason cannot exceed 300 characters').optional()
  })
});

const rejectOrderSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Rejection reason is required').max(500, 'Reason cannot exceed 500 characters')
  })
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      ORDER_STATUS.PHARMACY_ACCEPTED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY_FOR_PICKUP,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.COMPLETED
    ]),
    note: z.string().max(500, 'Note cannot exceed 500 characters').optional()
  })
});

module.exports = {
  createOrderSchema,
  cancelOrderSchema,
  rejectOrderSchema,
  updateOrderStatusSchema
};
