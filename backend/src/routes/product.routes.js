const { Router } = require('express');
const {
  authenticate,
  requireApprovedSeller,
} = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  productListQuerySchema,
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} = require('../validators/product.schema');
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleStock,
  deleteProduct,
} = require('../controllers/product.controller');

const router = Router();

router.get('/', validate(productListQuerySchema, 'query'), listProducts);
router.get('/:id', validate(productIdParamSchema, 'params'), getProductById);

router.post(
  '/',
  authenticate,
  requireApprovedSeller,
  upload.array('images', 4),
  validate(createProductSchema),
  createProduct
);

router.patch(
  '/:id',
  authenticate,
  requireApprovedSeller,
  validate(productIdParamSchema, 'params'),
  upload.array('images', 4),
  validate(updateProductSchema),
  updateProduct
);

router.patch(
  '/:id/stock',
  authenticate,
  requireApprovedSeller,
  validate(productIdParamSchema, 'params'),
  toggleStock
);

router.delete(
  '/:id',
  authenticate,
  requireApprovedSeller,
  validate(productIdParamSchema, 'params'),
  deleteProduct
);

module.exports = router;
