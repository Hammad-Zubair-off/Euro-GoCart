const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { validateCoupon } = require('../services/coupon.service');

const verifyCoupon = asyncHandler(async (req, res) => {
  const coupon = await validateCoupon(req.user, req.body.code);
  return ApiResponse.send(res, 200, coupon);
});

module.exports = { verifyCoupon };
