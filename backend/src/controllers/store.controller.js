const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBuffer } = require('../services/cloudinary.service');

const getMyStore = asyncHandler(async (req, res) => {
  const store = await prisma.store.findUnique({
    where: { userId: req.user.id },
  });

  // Powers /create-store status check: none | pending | approved | rejected
  const status = store ? store.status : 'none';

  return ApiResponse.send(res, 200, { store, status });
});

const createStore = asyncHandler(async (req, res) => {
  const existing = await prisma.store.findUnique({
    where: { userId: req.user.id },
  });
  if (existing) {
    throw new ApiError(409, 'You already have a store');
  }

  if (!req.file) {
    throw new ApiError(400, 'Store logo is required');
  }

  const logo = await uploadBuffer(req.file.buffer, 'euro-gocart/stores');

  const { name, username, description, email, contact, address } = req.body;

  const store = await prisma.store.create({
    data: {
      userId: req.user.id,
      name,
      username,
      description,
      email,
      contact,
      address,
      logo,
      status: 'pending',
      isActive: false,
    },
  });

  return ApiResponse.send(res, 201, store);
});

const getStoreByUsername = asyncHandler(async (req, res) => {
  const store = await prisma.store.findFirst({
    where: {
      username: req.params.username,
      status: 'approved',
      isActive: true,
    },
    include: {
      Product: {
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!store) {
    throw new ApiError(404, 'Store not found');
  }

  return ApiResponse.send(res, 200, store);
});

const getStoreDashboard = asyncHandler(async (req, res) => {
  const storeId = req.store.id;

  const [totalProducts, orders, ratings] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.order.findMany({
      where: { storeId },
      select: { total: true, isPaid: true },
    }),
    prisma.rating.findMany({
      where: { product: { storeId } },
      include: {
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Earnings from paid orders only
  const totalEarnings = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + o.total, 0);

  return ApiResponse.send(res, 200, {
    totalProducts,
    totalOrders: orders.length,
    totalEarnings,
    ratings,
  });
});

const getStoreProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { storeId: req.store.id },
    orderBy: { createdAt: 'desc' },
    include: { rating: true },
  });

  return ApiResponse.send(res, 200, products);
});

module.exports = {
  getMyStore,
  createStore,
  getStoreByUsername,
  getStoreDashboard,
  getStoreProducts,
};
