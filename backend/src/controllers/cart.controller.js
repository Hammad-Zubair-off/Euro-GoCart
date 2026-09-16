const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

function normalizeCart(cart) {
  if (cart && typeof cart === 'object' && !Array.isArray(cart)) {
    return { ...cart };
  }
  return {};
}

const getCart = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  return ApiResponse.send(res, 200, { cartItems: normalizeCart(user.cart) });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      inStock: true,
      store: { isActive: true, status: 'approved' },
    },
  });
  if (!product) {
    throw new ApiError(404, 'Product not found or unavailable');
  }

  // Atomic read-modify-write of User.cart JSON
  const cartItems = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: req.user.id } });
    const cart = normalizeCart(user.cart);
    cart[productId] = (cart[productId] || 0) + quantity;
    await tx.user.update({
      where: { id: req.user.id },
      data: { cart },
    });
    return cart;
  });

  return ApiResponse.send(res, 200, { cartItems });
});

const decreaseCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const cartItems = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: req.user.id } });
    const cart = normalizeCart(user.cart);

    if (!cart[productId]) {
      return cart;
    }

    // Mirrors Redux removeFromCart: decrement by 1, delete key at 0
    if (cart[productId] <= 1) {
      delete cart[productId];
    } else {
      cart[productId] -= 1;
    }

    await tx.user.update({
      where: { id: req.user.id },
      data: { cart },
    });
    return cart;
  });

  return ApiResponse.send(res, 200, { cartItems });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cartItems = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: req.user.id } });
    const cart = normalizeCart(user.cart);
    delete cart[productId];
    await tx.user.update({
      where: { id: req.user.id },
      data: { cart },
    });
    return cart;
  });

  return ApiResponse.send(res, 200, { cartItems });
});

const clearCart = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { cart: {} },
  });

  return ApiResponse.send(res, 200, { cartItems: {} });
});

module.exports = {
  getCart,
  addToCart,
  decreaseCart,
  removeFromCart,
  clearCart,
};
