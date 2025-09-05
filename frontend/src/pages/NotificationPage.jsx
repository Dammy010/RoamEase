import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  archiveNotification,
  bulkAction,
  getNotificationStats,
  setFilters,
  selectNotification,
  selectAllNotifications,
  clearSelection,
  clearError
} from '../redux/slices/notificationSlice';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Archive,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  X,
  User,
  Package,
  DollarSign,
  AlertTriangle,
  Shield,
  Building2,
  MessageSquare,
  FileText,
  Zap,
  Activity,
  ArrowRight,
  ArrowLeft,
  Grid,
  List
} from 'lucide-react';

const NotificationPage = () => {
  const dispatch = useDispatch();
  const { 
    notifications, 
    unreadCount, 
    stats, 
    pagination, 
    filters, 
    loading, 
    error, 
    selectedNotifications 
  } = useSelector((state) => state.notifications);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority', 'type'

  useEffect(() => {
    dispatch(getNotifications({ page: 1, limit: 20, status: filters.status }));
    dispatch(getUnreadCount());
    dispatch(getNotificationStats());
  }, [dispatch, filters.status]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(clearNotifications());
    dispatch(getNotifications({ page: 1, limit: 20, ...filters, ...newFilters }));
  };

  const handleMarkAsRead = async (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      dispatch(deleteNotification(notificationId));
    }
  };

  const handleArchive = async (notificationId) => {
    dispatch(archiveNotification(notificationId));
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) return;
    
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
      return;
    }
    
    dispatch(bulkAction({ action, notificationIds: selectedNotifications }));
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      // User notifications
      'shipment_created': PackageIcon,
      'bid_received': DollarSignIcon,
      'bid_accepted': CheckCircleIcon,
      'bid_rejected': XIcon,
      'shipment_delivered': PackageIcon,
      'shipment_received': CheckCircleIcon,
      'payment_received': DollarSignIcon,
      'payment_failed': AlertTriangleIcon,
      'dispute_created': AlertTriangleIcon,
      'dispute_resolved': CheckCircleIcon,
      'verification_approved': ShieldIcon,
      'verification_rejected': XIcon,
      'account_suspended': AlertTriangleIcon,
      'account_reactivated': CheckCircleIcon,
      
      // Logistics notifications
      'new_shipment_available': PackageIcon,
      'bid_placed': DollarSignIcon,
      'shipment_assigned': PackageIcon,
      'shipment_picked_up': PackageIcon,
      'payment_processed': DollarSignIcon,
      
      // Admin notifications
      'new_user_registered': UserIcon,
      'new_logistics_registered': Building2Icon,
      'verification_requested': ShieldIcon,
      'dispute_escalated': AlertTriangleIcon,
      'payment_issue': DollarSignIcon,
      'system_alert': AlertTriangleIcon,
      'high_volume_activity': ActivityIcon,
      'suspicious_activity': AlertTriangleIcon,
      'platform_maintenance': SettingsIcon,
      'feature_update': ZapIcon,
      'policy_update': FileTextIcon
    };
    
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-100';
    if (priority === 'high') return 'text-orange-600 bg-orange-100';
    if (priority === 'medium') return 'text-blue-600 bg-blue-100';
    if (priority === 'low') return 'text-gray-600 bg-gray-100';
    
    // Type-based colors
    const typeColors = {
      'payment_received': 'text-green-600 bg-green-100',
      'payment_failed': 'text-red-600 bg-red-100',
      'dispute_created': 'text-red-600 bg-red-100',
      'dispute_resolved': 'text-green-600 bg-green-100',
      'verification_approved': 'text-green-600 bg-green-100',
      'verification_rejected': 'text-red-600 bg-red-100',
      'system_alert': 'text-red-600 bg-red-100'
    };
    
    return typeColors[type] || 'text-blue-600 bg-blue-100';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'type':
        return a.type.localeCompare(b.type);
      default: // newest
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-gray-500">
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => dispatch(getNotifications({ page: 1, limit: 20, status: filters.status }))}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle filters"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
                <option value="type">Type</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('mark_read')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark as Read
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => dispatch(clearSelection())}
                className="px-3 py-1 bg-gray-400 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
          
          <button
            onClick={() => dispatch(selectAllNotifications())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Select All</span>
          </button>
        </div>

        {/* Notifications List */}
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {sortedNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const isSelected = selectedNotifications.includes(notification._id);
              const isUnread = notification.status === 'unread';
              
              return (
                <div
                  key={notification._id}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200 ${
                    isUnread ? 'ring-2 ring-blue-200' : ''
                  } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => dispatch(selectNotification(notification._id))}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.priority}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {notification.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleArchive(notification._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex space-x-2 mt-4">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button
              disabled={pagination.page === 1}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => dispatch(getNotifications({ page, limit: 20, status: filters.status }))}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
