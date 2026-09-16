const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimit');
const { getMe } = require('../controllers/auth.controller');

const router = Router();

router.get('/me', strictLimiter, authenticate, getMe);

module.exports = router;
