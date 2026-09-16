const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  addToCartSchema,
  decreaseCartSchema,
  cartProductParamSchema,
} = require('../validators/cart.schema');
const {
  getCart,
  addToCart,
  decreaseCart,
  removeFromCart,
  clearCart,
} = require('../controllers/cart.controller');

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/add', validate(addToCartSchema), addToCart);
router.post('/decrease', validate(decreaseCartSchema), decreaseCart);
router.delete('/', clearCart);
router.delete('/:productId', validate(cartProductParamSchema, 'params'), removeFromCart);

module.exports = router;
