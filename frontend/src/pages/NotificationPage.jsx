import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  createTestNotification,
  setFilters,
  selectNotification,
  selectAllNotifications,
  clearSelection,
  clearError,
  clearNotifications,
  addNotification,
  updateNotification,
  removeNotification
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
  Wallet,
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
  console.log('🔍 NotificationPage: Component is rendering');
  
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

  console.log('🔍 NotificationPage: Redux state:', {
    notifications: notifications?.length || 0,
    unreadCount,
    loading,
    error
  });


  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority', 'type'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const refreshIntervalRef = useRef(null);
  const notificationSoundRef = useRef(null);

  // Create mock notifications for testing when API is not available
  const createMockNotifications = useCallback(() => {
    const mockNotifications = [
      {
        _id: 'mock_1',
        title: 'New Shipment Posted',
        message: 'A new shipment from Lagos to Abuja is available for bidding',
        type: 'shipment_posted',
        priority: 'high',
        status: 'unread',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        _id: 'mock_2',
        title: 'Bid Accepted',
        message: 'Your bid for shipment #12345 has been accepted',
        type: 'bid_accepted',
        priority: 'medium',
        status: 'read',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        _id: 'mock_3',
        title: 'Payment Received',
        message: 'Payment of ₦15,000 has been received for shipment #12345',
        type: 'payment_received',
        priority: 'high',
        status: 'unread',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
      }
    ];
    
    return mockNotifications;
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 NotificationPage: Starting data fetch...');
      try {
        console.log('🔍 NotificationPage: Dispatching getNotifications...');
        const notificationsResult = await dispatch(getNotifications({ page: 1, limit: 20, status: filters.status }));
        console.log('🔍 NotificationPage: getNotifications result:', notificationsResult);
        
        console.log('🔍 NotificationPage: Dispatching getUnreadCount...');
        const unreadResult = await dispatch(getUnreadCount());
        console.log('🔍 NotificationPage: getUnreadCount result:', unreadResult);
        
        console.log('🔍 NotificationPage: Dispatching getNotificationStats...');
        const statsResult = await dispatch(getNotificationStats());
        console.log('🔍 NotificationPage: getNotificationStats result:', statsResult);
      } catch (error) {
        console.error('❌ NotificationPage: Error fetching data:', error);
        // If API fails, add mock notifications
        console.log('🔍 NotificationPage: Adding mock notifications...');
        const mockNotifications = createMockNotifications();
        mockNotifications.forEach(notification => {
          dispatch(addNotification(notification));
        });
      }
    };

    fetchData();
  }, [dispatch, filters.status, createMockNotifications]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const refreshNotifications = async () => {
      if (!loading) {
        setIsRefreshing(true);
        try {
          await dispatch(getNotifications({ page: 1, limit: 20, status: filters.status }));
          await dispatch(getUnreadCount());
          setLastRefreshTime(new Date());
        } catch (error) {
          console.error('Error refreshing notifications:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    // Set up interval
    refreshIntervalRef.current = setInterval(refreshNotifications, 30000);

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [dispatch, filters.status, loading]);

  // Real-time notification updates via WebSocket
  useEffect(() => {
    const handleRealTimeNotification = (event) => {
      const notification = event.detail;
      console.log('🔔 Real-time notification received:', notification);
      dispatch(addNotification(notification));
      
      // Play notification sound
      if (notificationSoundRef.current) {
        notificationSoundRef.current.play().catch(console.error);
      }
    };

    // Listen for real-time notifications
    window.addEventListener('notification', handleRealTimeNotification);

    return () => {
      window.removeEventListener('notification', handleRealTimeNotification);
    };
  }, [dispatch]);

  // Socket.io listeners for real-time notification updates
  useEffect(() => {
    let socket = null;
    
    const setupSocket = async () => {
      try {
        const { getSocket: socketFunction } = await import('../services/socket');
        socket = socketFunction();
        
        if (socket) {
          // Listen for new notification events
          socket.on('new-notification', (notification) => {
            console.log('🔔 New notification received via socket:', notification);
            console.log('🔔 Notification type:', notification.type);
            console.log('🔔 Notification title:', notification.title);
            console.log('🔔 Notification message:', notification.message);
            // Add the new notification to the list
            dispatch(addNotification(notification));
            // Update unread count
            dispatch(getUnreadCount());
            
            // Play notification sound
            if (notificationSoundRef.current) {
              notificationSoundRef.current.play().catch(console.error);
            }
          });

          // Listen for notification refresh events
          socket.on('notification-refresh', (data) => {
            console.log('🔔 Socket notification refresh received:', data);
            // Refresh notifications from the server
    dispatch(getNotifications({ page: 1, limit: 20, status: filters.status }));
    dispatch(getUnreadCount());
            
            // Play notification sound
            if (notificationSoundRef.current) {
              notificationSoundRef.current.play().catch(console.error);
            }
          });
        }
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.off('new-notification');
        socket.off('notification-refresh');
      }
    };
  }, [dispatch, filters.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(clearNotifications());
    dispatch(getNotifications({ page: 1, limit: 20, ...filters, ...newFilters }));
  }, [dispatch, filters]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(getNotifications({ page: 1, limit: 20, status: filters.status })),
        dispatch(getUnreadCount()),
        dispatch(getNotificationStats())
      ]);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, filters.status, isRefreshing]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await dispatch(markAllAsRead());
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [dispatch]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [dispatch]);

  const handleDelete = useCallback(async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [dispatch]);

  const handleNotificationClick = useCallback(async (notification) => {
    try {
      if (notification.status === 'unread') {
        await dispatch(markAsRead(notification._id));
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  }, [dispatch]);

  const handleArchive = useCallback(async (notificationId) => {
    try {
      await dispatch(archiveNotification(notificationId));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  }, [dispatch]);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedNotifications.length === 0) return;
    
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
      return;
    }
    
    try {
      await dispatch(bulkAction({ action, notificationIds: selectedNotifications }));
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  }, [dispatch, selectedNotifications]);

  const getNotificationIcon = (type) => {
    const iconMap = {
      // User notifications
      shipment_posted: Package,
      bid_accepted: CheckCircle,
      bid_rejected: X,
      payment_received: Wallet,
      shipment_delivered: CheckCircle,
      shipment_cancelled: X,
      
      // Logistics notifications
      new_bid: Wallet,
      bid_won: CheckCircle,
      bid_lost: X,
      shipment_assigned: Package,
      delivery_reminder: Clock,
      
      // System notifications
      system_update: Settings,
      security_alert: Shield,
      maintenance: AlertTriangle,
      feature_announcement: Bell,
      
      // Communication
      message_received: MessageSquare,
      new_message: MessageSquare,
      conversation_started: MessageSquare,
      conversation_updated: MessageSquare,
      chat_reminder: MessageSquare,
      
      // Documents
      document_uploaded: FileText,
      document_approved: CheckCircle,
      document_rejected: X,
      
      // Admin
      user_registered: User,
      logistics_verified: Building2,
      dispute_reported: AlertTriangle,
      
      // Default
      default: Bell
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
      shipment_posted: 'text-blue-600 bg-blue-100',
      bid_accepted: 'text-green-600 bg-green-100',
      bid_rejected: 'text-red-600 bg-red-100',
      payment_received: 'text-green-600 bg-green-100',
      shipment_delivered: 'text-green-600 bg-green-100',
      shipment_cancelled: 'text-red-600 bg-red-100',
      new_bid: 'text-purple-600 bg-purple-100',
      bid_won: 'text-green-600 bg-green-100',
      bid_lost: 'text-red-600 bg-red-100',
      system_update: 'text-blue-600 bg-blue-100',
      security_alert: 'text-red-600 bg-red-100',
      maintenance: 'text-orange-600 bg-orange-100',
      feature_announcement: 'text-purple-600 bg-purple-100',
      message_received: 'text-blue-600 bg-blue-100',
      new_message: 'text-indigo-600 bg-indigo-100',
      conversation_started: 'text-purple-600 bg-purple-100',
      conversation_updated: 'text-blue-600 bg-blue-100',
      chat_reminder: 'text-cyan-600 bg-cyan-100',
      document_uploaded: 'text-gray-600 bg-gray-100',
      document_approved: 'text-green-600 bg-green-100',
      document_rejected: 'text-red-600 bg-red-100',
      user_registered: 'text-blue-600 bg-blue-100',
      logistics_verified: 'text-green-600 bg-green-100',
      dispute_reported: 'text-red-600 bg-red-100'
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

  // Debug logging
  console.log('🔍 NotificationPage Debug:', {
    notifications: notifications,
    notificationsLength: notifications?.length,
    loading: loading,
    error: error,
    unreadCount: unreadCount,
    notificationsType: typeof notifications,
    isArray: Array.isArray(notifications)
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filters.status || filters.status === 'all' || notification.status === filters.status;
    const matchesType = !filters.type || filters.type === 'all' || notification.type === filters.type;
    const matchesPriority = !filters.priority || filters.priority === 'all' || notification.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
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

  // Loading skeleton component
  const NotificationSkeleton = () => (
    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-4 h-4 bg-gray-300 rounded mt-1"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle case where notifications is not an array (this should never happen with proper Redux state)
  if (!Array.isArray(notifications)) {
    console.log('🔍 NotificationPage: Notifications is not an array:', notifications);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Invalid Data Format</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Notifications data is not in the expected format.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 shadow-sm">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-6 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error if there's one
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading Notifications</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => {
              dispatch(clearError());
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen">
      {/* Notification Sound */}
      <audio ref={notificationSoundRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.wav" type="audio/wav" />
      </audio>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 shadow-sm">
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
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Refresh notifications"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Last Refresh Time */}
              <div className="text-sm text-gray-500">
                Last updated: {lastRefreshTime.toLocaleTimeString()}
            </div>
            
              {/* Auto-refresh indicator */}
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Auto-refresh</span>
              </div>
            </div>
            </div>
          </div>
        </div>

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
            <span>{unreadCount === 0 ? 'All Read' : `Mark All as Read (${unreadCount})`}</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type || 'all'}
                  onChange={(e) => handleFilterChange({ type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="new_message">Chat Messages</option>
                  <option value="conversation_started">New Conversations</option>
                  <option value="bid_accepted">Bid Accepted</option>
                  <option value="bid_rejected">Bid Rejected</option>
                  <option value="shipment_posted">New Shipments</option>
                  <option value="payment_received">Payments</option>
                  <option value="system_update">System Updates</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority || 'all'}
                  onChange={(e) => handleFilterChange({ priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchQuery ? 'No notifications found' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters' 
                : 'You\'ll see notifications here when they arrive'
              }
            </p>
            {searchQuery && (
                <button
                onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                Clear Search
                </button>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {sortedNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const isSelected = selectedNotifications.includes(notification._id);
              const isUnread = notification.status === 'unread';
              
              return (
                <div
                  key={notification._id}
                  className={`bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                    isUnread ? 'ring-2 ring-blue-200 bg-blue-50/30' : 'opacity-75'
                  } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        dispatch(selectNotification(notification._id));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    {/* Icon */}
                    <div className={`p-3 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                            {notification.title}
                          </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800 dark:text-gray-200'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`mt-1 line-clamp-2 ${isUnread ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                            {notification.type === 'new_message' && notification.metadata?.senderName ? 
                              `From ${notification.metadata.senderName}: ${notification.message}` :
                              notification.message
                            }
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                              {notification.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          
                          {/* Chat Action Button */}
                          {(notification.type === 'new_message' || notification.type === 'conversation_started') && (
                            <div className="mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notification.metadata?.conversationId) {
                                    window.location.href = `/chat?conversation=${notification.metadata.conversationId}`;
                                  }
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                View Chat
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                      {isUnread ? (
                            <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                      ) : (
                        <div className="p-2 text-green-600 bg-green-100 rounded-lg" title="Already read">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                          )}
                          
                          <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(notification._id);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          
                          <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {selectedNotifications.length} selected
              </span>
              <div className="flex items-center space-x-2">
                {(() => {
                  const selectedUnreadCount = selectedNotifications.filter(id => {
                    const notification = notifications.find(n => n._id === id);
                    return notification && notification.status === 'unread';
                  }).length;
                  
                  return selectedUnreadCount > 0 ? (
                    <button
                      onClick={() => handleBulkAction('mark_read')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Read ({selectedUnreadCount})
                    </button>
                  ) : null;
                })()}
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => dispatch(clearSelection())}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              disabled={pagination.page === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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