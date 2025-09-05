const NotificationService = require('../services/notificationService');
const User = require('../models/User');

/**
 * GET /api/notifications
 * Get user's notifications with pagination and filtering
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const userId = req.user._id;

    const result = await NotificationService.getUserNotifications(
      userId,
      parseInt(page),
      parseInt(limit),
      status
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the user
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      notification
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

/**
 * PUT /api/notifications/:id/archive
 * Archive a notification
 */
const archiveNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationService.archiveNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification archived successfully',
      notification
    });
  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive notification',
      error: error.message
    });
  }
};

/**
 * POST /api/notifications/test
 * Create a test notification (for testing purposes)
 */
const createTestNotification = async (req, res) => {
  try {
    const { title, message, type = 'system_alert', priority = 'medium' } = req.body;
    const userId = req.user._id;

    const notification = await NotificationService.createNotification({
      recipient: userId,
      type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      priority,
      metadata: { test: true }
    });

    res.json({
      success: true,
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
};

/**
 * GET /api/notifications/stats
 * Get notification statistics for the user
 */
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const Notification = require('../models/Notification');

    const [
      total,
      unread,
      read,
      archived,
      byType
    ] = await Promise.all([
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, status: 'unread' }),
      Notification.countDocuments({ recipient: userId, status: 'read' }),
      Notification.countDocuments({ recipient: userId, status: 'archived' }),
      Notification.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total,
        unread,
        read,
        archived,
        byType
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics',
      error: error.message
    });
  }
};

/**
 * POST /api/notifications/bulk-action
 * Perform bulk actions on notifications
 */
const bulkAction = async (req, res) => {
  try {
    const { action, notificationIds } = req.body;
    const userId = req.user._id;

    if (!action || !notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and notification IDs are required'
      });
    }

    const Notification = require('../models/Notification');
    let result;

    switch (action) {
      case 'mark_read':
        result = await Notification.updateMany(
          { _id: { $in: notificationIds }, recipient: userId },
          { status: 'read', readAt: new Date() }
        );
        break;
      case 'mark_unread':
        result = await Notification.updateMany(
          { _id: { $in: notificationIds }, recipient: userId },
          { status: 'unread', $unset: { readAt: 1 } }
        );
        break;
      case 'archive':
        result = await Notification.updateMany(
          { _id: { $in: notificationIds }, recipient: userId },
          { status: 'archived', archivedAt: new Date() }
        );
        break;
      case 'delete':
        result = await Notification.deleteMany(
          { _id: { $in: notificationIds }, recipient: userId }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  archiveNotification,
  createTestNotification,
  getNotificationStats,
  bulkAction
};
