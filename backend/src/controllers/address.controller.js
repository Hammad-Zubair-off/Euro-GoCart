const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return ApiResponse.send(res, 200, addresses);
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.create({
    data: {
      ...req.body,
      userId: req.user.id,
    },
  });
  return ApiResponse.send(res, 201, address);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const existing = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) {
    throw new ApiError(404, 'Address not found');
  }

  await prisma.address.delete({ where: { id: existing.id } });
  return ApiResponse.send(res, 200, { id: existing.id });
});

module.exports = { listAddresses, createAddress, deleteAddress };
