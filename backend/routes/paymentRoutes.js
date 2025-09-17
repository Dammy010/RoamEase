const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { initializePayment, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { verifyPaystackSignature, handlePaystackWebhook } = require('../controllers/paystackWebhook');

// Webhook FIRST (raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), verifyPaystackSignature, handlePaystackWebhook);

// Authenticated JSON routes
router.post('/initialize', protect, initializePayment);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
