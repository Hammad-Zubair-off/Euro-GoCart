const { z } = require('zod');

const createRatingSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().min(1),
});

module.exports = { createRatingSchema };
