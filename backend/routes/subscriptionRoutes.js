const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription
} = require('../controllers/subscriptionController');

// All routes require authentication
router.use(protect);

// Create new subscription
router.post('/create', createSubscription);

// Confirm subscription payment
router.post('/confirm', confirmSubscription);

// Get user subscriptions
router.get('/my-subscriptions', getUserSubscriptions);

// Cancel subscription
router.delete('/:subscriptionId/cancel', cancelSubscription);

module.exports = router;
