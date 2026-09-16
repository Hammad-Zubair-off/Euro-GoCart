const { z } = require('zod');

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive().optional().default(1),
});

const decreaseCartSchema = z.object({
  productId: z.string().min(1),
});

const cartProductParamSchema = z.object({
  productId: z.string().min(1),
});

module.exports = { addToCartSchema, decreaseCartSchema, cartProductParamSchema };
