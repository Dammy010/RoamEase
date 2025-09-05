const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { createPaymentIntent, confirmPayment, getPaymentHistory } = require('../controllers/paymentController');
const { stripeWebhook } = require('../controllers/stripeWebhook');

// Webhook FIRST (raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Authenticated JSON routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
