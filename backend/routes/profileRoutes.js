const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  uploadProfilePicture,
  deleteAccount,
  getProfileStats
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// All routes require authentication
router.use(protect);

// Profile management routes
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/upload-profile-picture', uploadMiddleware.single('profilePicture'), uploadProfilePicture);
router.delete('/delete-account', deleteAccount);
router.get('/profile-stats', getProfileStats);

module.exports = router;
