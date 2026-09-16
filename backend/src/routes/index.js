const { Router } = require('express');
const authRoutes = require('./auth.routes');
const storeRoutes = require('./store.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const addressRoutes = require('./address.routes');
const couponRoutes = require('./coupon.routes');
const orderRoutes = require('./order.routes');
const ratingRoutes = require('./rating.routes');
const adminRoutes = require('./admin.routes');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

router.get('/health', (req, res) => {
  ApiResponse.send(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use(storeRoutes); // mounts /stores/:username and /store/*
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/addresses', addressRoutes);
router.use('/coupons', couponRoutes);
router.use('/orders', orderRoutes);
router.use('/ratings', ratingRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
