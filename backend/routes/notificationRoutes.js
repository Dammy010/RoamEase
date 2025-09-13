const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  archiveNotification,
  createTestNotification,
  getNotificationStats,
  bulkAction,
  debugRecentNotifications,
  testChatNotification,
  testNotificationSystem
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// All notification routes require authentication except test routes
// router.use(protect); // Commented out to allow test routes without auth

// Get user's notifications with pagination and filtering
router.get('/', protect, getNotifications);

// Get unread notification count
router.get('/unread-count', protect, getUnreadCount);

// Get notification statistics
router.get('/stats', protect, getNotificationStats);

// Mark a specific notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', protect, markAllAsRead);

// Archive a notification
router.put('/:id/archive', protect, archiveNotification);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

// Bulk actions on notifications
router.post('/bulk-action', protect, bulkAction);

// Create test notification (for testing purposes)
router.post('/test', protect, createTestNotification);

// Debug endpoint to check recent notifications
router.get('/debug/recent', protect, debugRecentNotifications);

// Test endpoint to create a chat notification
router.post('/test/chat', testChatNotification);

// Test endpoint to test the notification system
router.post('/test/system', testNotificationSystem);

module.exports = router;
