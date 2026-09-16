const { z } = require('zod');

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const productListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  storeUsername: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  mrp: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  category: z.string().min(1),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  mrp: z.coerce.number().positive().optional(),
  price: z.coerce.number().positive().optional(),
  category: z.string().min(1).optional(),
});

const productIdParamSchema = z.object({
  id: z.string().min(1),
});

module.exports = {
  productListQuerySchema,
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
};
