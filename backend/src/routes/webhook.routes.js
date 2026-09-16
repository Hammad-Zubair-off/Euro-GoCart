const { Router } = require('express');
const { handleStripeWebhook } = require('../controllers/webhook.controller');

const router = Router();

// Raw body is applied in app.js before this router is mounted
router.post('/stripe', handleStripeWebhook);

module.exports = router;
