const { z } = require('zod');

const checkoutSchema = z.object({
  addressId: z.string().min(1),
  paymentMethod: z.enum(['COD', 'STRIPE']),
  couponCode: z.string().min(1).optional(),
});

const orderStatusSchema = z.object({
  status: z.enum(['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
});

const orderIdParamSchema = z.object({
  id: z.string().min(1),
});

module.exports = { checkoutSchema, orderStatusSchema, orderIdParamSchema };
