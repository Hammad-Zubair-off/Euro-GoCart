const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { strictLimiter } = require('../middleware/rateLimit');
const { verifyCouponSchema } = require('../validators/coupon.schema');
const { verifyCoupon } = require('../controllers/coupon.controller');

const router = Router();

router.post(
  '/verify',
  strictLimiter,
  authenticate,
  validate(verifyCouponSchema),
  verifyCoupon
);

module.exports = router;
