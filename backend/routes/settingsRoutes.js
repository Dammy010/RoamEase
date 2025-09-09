const express = require('express');
const router = express.Router();
const {
  updateSettings,
  updateNotifications,
  updatePrivacy,
  getSettings,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  removeProfilePicture
} = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// All routes require authentication
router.use(protect);

// Settings management routes
router.put('/settings', updateSettings);
router.put('/notification-preferences', updateNotifications);
router.put('/privacy-settings', updatePrivacy);
router.get('/settings', getSettings);

// Profile management routes
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/upload-profile-picture', upload.single('profilePicture'), uploadProfilePicture);
router.delete('/profile-picture', removeProfilePicture);

module.exports = router;
