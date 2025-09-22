const express = require("express");
const router = express.Router();
const {
  getUserSettings,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateGeneralPreferences,
  testNotificationPreferences,
} = require("../controllers/settingsController");
const { protect } = require("../middlewares/authMiddleware");

// Apply authentication middleware to all routes
router.use(protect);

// Get user settings
router.get("/", getUserSettings);

// Update general settings (catch-all for general settings updates)
router.put("/settings", updateGeneralPreferences);

// Update profile settings
router.put("/profile", updateGeneralPreferences);

// Update notification preferences
router.put("/notifications", updateNotificationPreferences);

// Update privacy settings
router.put("/privacy", updatePrivacySettings);

// Update general preferences
router.put("/preferences", updateGeneralPreferences);

// Test notification preferences
router.post("/test-notification", testNotificationPreferences);

module.exports = router;
