const prisma = require('../config/prisma');
const env = require('../config/env');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getMe = asyncHandler(async (req, res) => {
  const store = await prisma.store.findUnique({
    where: { userId: req.user.id },
  });

  const isAdmin = env.adminEmails.includes((req.user.email || '').toLowerCase());

  return ApiResponse.send(res, 200, {
    user: req.user,
    store,
    isAdmin,
  });
});

module.exports = { getMe };
