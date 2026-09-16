const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRatingSchema } = require('../validators/rating.schema');
const { createRating } = require('../controllers/rating.controller');

const router = Router();

router.post('/', authenticate, validate(createRatingSchema), createRating);

module.exports = router;
