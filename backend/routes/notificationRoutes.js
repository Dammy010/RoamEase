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

// All notification routes require authentication
router.use(protect);

// Get user's notifications with pagination and filtering
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark a specific notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Archive a notification
router.put('/:id/archive', archiveNotification);

// Delete a notification
router.delete('/:id', deleteNotification);

// Bulk actions on notifications
router.post('/bulk-action', bulkAction);

// Create test notification (for testing purposes)
router.post('/test', createTestNotification);

// Debug endpoint to check recent notifications
router.get('/debug/recent', debugRecentNotifications);

// Test endpoint to create a chat notification
router.post('/test/chat', testChatNotification);

// Test endpoint to test the notification system
router.post('/test/system', testNotificationSystem);

module.exports = router;
