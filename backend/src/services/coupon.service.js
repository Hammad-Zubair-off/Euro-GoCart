const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Validate a coupon code for the given user. Used by verify endpoint and checkout.
 */
async function validateCoupon(user, code) {
  if (!code || typeof code !== 'string') {
    throw new ApiError(400, 'Coupon code is required');
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim() },
  });

  if (!coupon) {
    throw new ApiError(400, 'Coupon not found');
  }

  if (new Date(coupon.expiresAt) < new Date()) {
    throw new ApiError(400, 'Coupon has expired');
  }

  // Non-public coupons are not usable on customer-facing verify/checkout paths
  if (!coupon.isPublic) {
    throw new ApiError(400, 'Coupon is not available');
  }

  if (coupon.forNewUser) {
    const priorOrders = await prisma.order.count({
      where: { userId: user.id },
    });
    if (priorOrders > 0) {
      throw new ApiError(400, 'Coupon is only valid for new users');
    }
  }

  // forMember: placeholder until a membership system exists — treat as valid for any authenticated user
  if (coupon.forMember) {
    // no-op: any authenticated user qualifies for now
  }

  return coupon;
}

module.exports = { validateCoupon };
