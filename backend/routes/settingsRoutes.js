const express = require('express');
const router = express.Router();
const {
  getUserSettings,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateGeneralPreferences,
  subscribeToPush,
  unsubscribeFromPush,
  getPushPublicKey,
  testNotificationPreferences
} = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Get user settings
router.get('/', getUserSettings);

// Update notification preferences
router.put('/notifications', updateNotificationPreferences);

// Update privacy settings
router.put('/privacy', updatePrivacySettings);

// Update general preferences
router.put('/preferences', updateGeneralPreferences);

// Push notification management
router.post('/push/subscribe', subscribeToPush);
router.post('/push/unsubscribe', unsubscribeFromPush);
router.get('/push/public-key', getPushPublicKey);

// Test notification preferences
router.post('/test-notification', testNotificationPreferences);

module.exports = router;