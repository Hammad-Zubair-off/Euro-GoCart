const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { strictLimiter } = require('../middleware/rateLimit');
const { checkoutSchema } = require('../validators/order.schema');
const { checkout, listMyOrders } = require('../controllers/order.controller');

const router = Router();

router.use(authenticate);

router.post('/checkout', strictLimiter, validate(checkoutSchema), checkout);
router.get('/', listMyOrders);

module.exports = router;
