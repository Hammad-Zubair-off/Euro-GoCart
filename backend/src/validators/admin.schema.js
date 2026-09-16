const { z } = require('zod');

const adminStoresQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

const storeStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

const storeIdParamSchema = z.object({
  id: z.string().min(1),
});

module.exports = { adminStoresQuerySchema, storeStatusSchema, storeIdParamSchema };
