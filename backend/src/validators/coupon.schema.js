const { z } = require('zod');

const verifyCouponSchema = z.object({
  code: z.string().min(1),
});

const createCouponSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
  discount: z.coerce.number().positive().max(100),
  forNewUser: z.coerce.boolean(),
  forMember: z.coerce.boolean().optional().default(false),
  isPublic: z.coerce.boolean(),
  expiresAt: z.coerce.date(),
});

const couponCodeParamSchema = z.object({
  code: z.string().min(1),
});

module.exports = { verifyCouponSchema, createCouponSchema, couponCodeParamSchema };
