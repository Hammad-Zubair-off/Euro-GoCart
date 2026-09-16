const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const [products, orders, stores, allOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ select: { total: true, isPaid: true, createdAt: true } }),
    prisma.store.count(),
    prisma.order.findMany({
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const revenue = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + o.total, 0);

  return ApiResponse.send(res, 200, {
    products,
    revenue,
    orders: orders.length,
    stores,
    allOrders,
  });
});

const listStores = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) {
    where.status = req.query.status;
  }

  const stores = await prisma.store.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return ApiResponse.send(res, 200, stores);
});

const updateStoreStatus = asyncHandler(async (req, res) => {
  const existing = await prisma.store.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, 'Store not found');
  }

  const { status } = req.body;
  // Approving also sets isActive: true
  const data =
    status === 'approved'
      ? { status: 'approved', isActive: true }
      : { status: 'rejected' };

  const store = await prisma.store.update({
    where: { id: existing.id },
    data,
  });

  return ApiResponse.send(res, 200, store);
});

const toggleStoreActive = asyncHandler(async (req, res) => {
  const existing = await prisma.store.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, 'Store not found');
  }

  const store = await prisma.store.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
  });

  return ApiResponse.send(res, 200, store);
});

const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return ApiResponse.send(res, 200, coupons);
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await prisma.coupon.create({
    data: req.body,
  });
  return ApiResponse.send(res, 201, coupon);
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const existing = await prisma.coupon.findUnique({
    where: { code: req.params.code },
  });
  if (!existing) {
    throw new ApiError(404, 'Coupon not found');
  }

  await prisma.coupon.delete({ where: { code: existing.code } });
  return ApiResponse.send(res, 200, { code: existing.code });
});

module.exports = {
  getDashboard,
  listStores,
  updateStoreStatus,
  toggleStoreActive,
  listCoupons,
  createCoupon,
  deleteCoupon,
};
