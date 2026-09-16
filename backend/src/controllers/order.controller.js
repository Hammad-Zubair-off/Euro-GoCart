const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { buildOrdersFromCart } = require('../services/order.service');
const { createCheckoutSession } = require('../services/stripe.service');

const checkout = asyncHandler(async (req, res) => {
  // Re-fetch user so cart is current
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const { addressId, paymentMethod, couponCode } = req.body;

  const orders = await buildOrdersFromCart({
    user,
    addressId,
    paymentMethod,
    couponCode,
  });

  if (paymentMethod === 'COD') {
    return ApiResponse.send(res, 201, { orders });
  }

  // STRIPE: create Checkout Session; webhook flips isPaid
  const orderIds = orders.map((o) => o.id);
  const totalAmount = orders.reduce((sum, o) => sum + o.total, 0);

  const session = await createCheckoutSession({
    orderIds,
    totalAmount,
    customerEmail: user.email,
  });

  return ApiResponse.send(res, 201, { url: session.url, orders });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: { include: { product: true } },
      address: true,
      store: { select: { name: true } },
    },
  });

  return ApiResponse.send(res, 200, orders);
});

const listStoreOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { storeId: req.store.id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      address: true,
      orderItems: { include: { product: true } },
    },
  });

  return ApiResponse.send(res, 200, orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const existing = await prisma.order.findFirst({
    where: { id: req.params.id, storeId: req.store.id },
  });
  if (!existing) {
    throw new ApiError(404, 'Order not found');
  }

  const order = await prisma.order.update({
    where: { id: existing.id },
    data: { status: req.body.status },
    include: {
      orderItems: { include: { product: true } },
      address: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return ApiResponse.send(res, 200, order);
});

module.exports = {
  checkout,
  listMyOrders,
  listStoreOrders,
  updateOrderStatus,
};
