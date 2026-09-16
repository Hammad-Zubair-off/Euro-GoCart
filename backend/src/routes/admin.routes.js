const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  adminStoresQuerySchema,
  storeStatusSchema,
  storeIdParamSchema,
} = require('../validators/admin.schema');
const {
  createCouponSchema,
  couponCodeParamSchema,
} = require('../validators/coupon.schema');
const {
  getDashboard,
  listStores,
  updateStoreStatus,
  toggleStoreActive,
  listCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/admin.controller');

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/stores', validate(adminStoresQuerySchema, 'query'), listStores);
router.patch(
  '/stores/:id/status',
  validate(storeIdParamSchema, 'params'),
  validate(storeStatusSchema),
  updateStoreStatus
);
router.patch(
  '/stores/:id/toggle-active',
  validate(storeIdParamSchema, 'params'),
  toggleStoreActive
);
router.get('/coupons', listCoupons);
router.post('/coupons', validate(createCouponSchema), createCoupon);
router.delete(
  '/coupons/:code',
  validate(couponCodeParamSchema, 'params'),
  deleteCoupon
);

module.exports = router;
