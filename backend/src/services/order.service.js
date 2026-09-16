const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { validateCoupon } = require('./coupon.service');

/**
 * Group cart line items by product.storeId.
 * cartItems: { [productId]: quantity }
 */
function groupCartByStore(products, cartItems) {
  const groups = {};

  for (const product of products) {
    const quantity = cartItems[product.id];
    if (!quantity || quantity < 1) continue;

    if (!groups[product.storeId]) {
      groups[product.storeId] = [];
    }
    groups[product.storeId].push({
      productId: product.id,
      quantity,
      price: product.price, // always use DB price — never trust client
    });
  }

  return groups;
}

/**
 * Build and persist one Order (+ OrderItems) per store group from the user's cart.
 * Returns the created orders. Clears the cart after success.
 */
async function buildOrdersFromCart({
  user,
  addressId,
  paymentMethod,
  couponCode,
}) {
  const cartItems =
    user.cart && typeof user.cart === 'object' && !Array.isArray(user.cart)
      ? user.cart
      : {};

  const productIds = Object.keys(cartItems);
  if (productIds.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      inStock: true,
      store: { isActive: true, status: 'approved' },
    },
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'One or more cart products are unavailable');
  }

  let coupon = null;
  if (couponCode) {
    coupon = await validateCoupon(user, couponCode);
  }

  const groups = groupCartByStore(products, cartItems);
  const storeIds = Object.keys(groups);
  if (storeIds.length === 0) {
    throw new ApiError(400, 'No valid items to order');
  }

  const couponSnapshot = coupon
    ? {
        code: coupon.code,
        description: coupon.description,
        discount: coupon.discount,
        forNewUser: coupon.forNewUser,
        forMember: coupon.forMember,
        isPublic: coupon.isPublic,
        expiresAt: coupon.expiresAt,
      }
    : {};

  const orders = await prisma.$transaction(async (tx) => {
    const created = [];

    for (const storeId of storeIds) {
      const items = groups[storeId];
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      // Apply the same discount percentage independently to each store-group subtotal
      const discountAmount = coupon ? subtotal * (coupon.discount / 100) : 0;
      const total = Math.round((subtotal - discountAmount) * 100) / 100;

      const order = await tx.order.create({
        data: {
          total,
          userId: user.id,
          storeId,
          addressId,
          paymentMethod,
          isPaid: false,
          isCouponUsed: Boolean(coupon),
          coupon: couponSnapshot,
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: { include: { product: true } },
          address: true,
          store: { select: { id: true, name: true, username: true } },
        },
      });

      created.push(order);
    }

    // Clear entire cart after orders are created
    await tx.user.update({
      where: { id: user.id },
      data: { cart: {} },
    });

    return created;
  });

  return orders;
}

module.exports = { groupCartByStore, buildOrdersFromCart };
