const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAddressSchema,
  addressIdParamSchema,
} = require('../validators/address.schema');
const {
  listAddresses,
  createAddress,
  deleteAddress,
} = require('../controllers/address.controller');

const router = Router();

router.use(authenticate);

router.get('/', listAddresses);
router.post('/', validate(createAddressSchema), createAddress);
router.delete('/:id', validate(addressIdParamSchema, 'params'), deleteAddress);

module.exports = router;
