const { z } = require('zod');

const createStoreSchema = z.object({
  name: z.string().min(1),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric or underscore'),
  description: z.string().min(1),
  email: z.string().email(),
  contact: z.string().min(1),
  address: z.string().min(1),
});

const storeUsernameParamSchema = z.object({
  username: z.string().min(1),
});

module.exports = { createStoreSchema, storeUsernameParamSchema };
