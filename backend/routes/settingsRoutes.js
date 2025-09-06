const express = require('express');
const router = express.Router();
const {
  updateSettings,
  updateNotifications,
  updatePrivacy,
  getSettings
} = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Settings management routes
router.put('/settings', updateSettings);
router.put('/notification-preferences', updateNotifications);
router.put('/privacy-settings', updatePrivacy);
router.get('/settings', getSettings);

module.exports = router;
