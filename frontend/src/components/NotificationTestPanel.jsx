import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getNotifications, 
  getUnreadCount, 
  createTestNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearError
} from '../redux/slices/notificationSlice';
import { 
  Bell, 
  Plus, 
  Check, 
  CheckCheck, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Package,
  Wallet,
  Shield,
  Settings
} from 'lucide-react';

const NotificationTestPanel = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  
  const [testNotification, setTestNotification] = useState({
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'system_alert',
    priority: 'medium'
  });

  useEffect(() => {
    // Load notifications when component mounts
    dispatch(getNotifications({ page: 1, limit: 20, status: 'all' }));
    dispatch(getUnreadCount());
  }, [dispatch]);

  const handleCreateTestNotification = async () => {
    try {
      await dispatch(createTestNotification(testNotification));
      // Refresh notifications after creating
      dispatch(getNotifications({ page: 1, limit: 20, status: 'all' }));
      dispatch(getUnreadCount());
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId));
      dispatch(getUnreadCount());
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead());
      dispatch(getNotifications({ page: 1, limit: 20, status: 'all' }));
      dispatch(getUnreadCount());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId));
      dispatch(getNotifications({ page: 1, limit: 20, status: 'all' }));
      dispatch(getUnreadCount());
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
      case 'message_received':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'shipment_created':
      case 'shipment_delivered':
        return <Package className="w-5 h-5 text-green-500" />;
      case 'payment_received':
      case 'payment_failed':
        return <Wallet className="w-5 h-5 text-yellow-500" />;
      case 'verification_approved':
      case 'verification_rejected':
        return <Shield className="w-5 h-5 text-purple-500" />;
      case 'system_alert':
      case 'platform_maintenance':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to test notifications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notification Test Panel
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Unread: {unreadCount}
          </span>
          <button
            onClick={() => {
              dispatch(getNotifications({ page: 1, limit: 20, status: 'all' }));
              dispatch(getUnreadCount());
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Create Test Notification */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Test Notification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={testNotification.title}
              onChange={(e) => setTestNotification({ ...testNotification, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={testNotification.type}
              onChange={(e) => setTestNotification({ ...testNotification, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="system_alert">System Alert</option>
              <option value="new_message">New Message</option>
              <option value="shipment_created">Shipment Created</option>
              <option value="shipment_delivered">Shipment Delivered</option>
              <option value="payment_received">Payment Received</option>
              <option value="verification_approved">Verification Approved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={testNotification.priority}
              onChange={(e) => setTestNotification({ ...testNotification, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <input
              type="text"
              value={testNotification.message}
              onChange={(e) => setTestNotification({ ...testNotification, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleCreateTestNotification}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Test Notification'}
        </button>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={handleMarkAllAsRead}
          disabled={loading || unreadCount === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4" />
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notifications ({notifications.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No notifications found</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 border rounded-lg transition-colors ${
                notification.status === 'unread'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.status === 'unread' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationTestPanel;
