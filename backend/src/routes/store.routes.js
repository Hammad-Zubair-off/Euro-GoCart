const { Router } = require('express');
const {
  authenticate,
  requireApprovedSeller,
} = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createStoreSchema,
  storeUsernameParamSchema,
} = require('../validators/store.schema');
const {
  getMyStore,
  createStore,
  getStoreByUsername,
  getStoreDashboard,
  getStoreProducts,
} = require('../controllers/store.controller');
const {
  listStoreOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const {
  orderStatusSchema,
  orderIdParamSchema,
} = require('../validators/order.schema');

const router = Router();

// Public store profile
router.get(
  '/stores/:username',
  validate(storeUsernameParamSchema, 'params'),
  getStoreByUsername
);

// Authenticated seller / store routes under /api/store
router.get('/store/me', authenticate, getMyStore);
router.post(
  '/store',
  authenticate,
  upload.single('logo'),
  validate(createStoreSchema),
  createStore
);
router.get('/store/dashboard', authenticate, requireApprovedSeller, getStoreDashboard);
router.get('/store/products', authenticate, requireApprovedSeller, getStoreProducts);
router.get('/store/orders', authenticate, requireApprovedSeller, listStoreOrders);
router.patch(
  '/store/orders/:id/status',
  authenticate,
  requireApprovedSeller,
  validate(orderIdParamSchema, 'params'),
  validate(orderStatusSchema),
  updateOrderStatus
);

module.exports = router;
