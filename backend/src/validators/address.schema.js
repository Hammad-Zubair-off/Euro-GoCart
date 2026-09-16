const { z } = require('zod');

const createAddressSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(1),
});

const addressIdParamSchema = z.object({
  id: z.string().min(1),
});

module.exports = { createAddressSchema, addressIdParamSchema };
