import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ===== ASYNC THUNKS =====

// Get user notifications
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async ({ page = 1, limit = 20, status = 'all' }, thunkAPI) => {
    try {
      console.log('🔔 Fetching notifications:', { page, limit, status });
      const res = await api.get(`/notifications?page=${page}&limit=${limit}&status=${status}`);
      console.log('🔔 Notifications response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, thunkAPI) => {
    try {
      console.log('🔔 Fetching unread count...');
      const res = await api.get('/notifications/unread-count');
      console.log('🔔 Unread count response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Error fetching unread count:', err);
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, thunkAPI) => {
    try {
      const res = await api.put(`/notifications/${notificationId}/read`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, thunkAPI) => {
    try {
      const res = await api.put('/notifications/mark-all-read');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, thunkAPI) => {
    try {
      const res = await api.delete(`/notifications/${notificationId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Archive notification
export const archiveNotification = createAsyncThunk(
  'notifications/archiveNotification',
  async (notificationId, thunkAPI) => {
    try {
      const res = await api.put(`/notifications/${notificationId}/archive`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Bulk action on notifications
export const bulkAction = createAsyncThunk(
  'notifications/bulkAction',
  async ({ action, notificationIds }, thunkAPI) => {
    try {
      const res = await api.post('/notifications/bulk-action', { action, notificationIds });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Get notification stats
export const getNotificationStats = createAsyncThunk(
  'notifications/getNotificationStats',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/notifications/stats');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Create test notification
export const createTestNotification = createAsyncThunk(
  'notifications/createTestNotification',
  async ({ title, message, type, priority }, thunkAPI) => {
    try {
      const res = await api.post('/notifications/test', { title, message, type, priority });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// ===== SLICE =====

const initialState = {
  notifications: [],
  unreadCount: 0,
  stats: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  filters: {
    status: 'all',
    type: 'all',
    priority: 'all'
  },
  loading: false,
  error: null,
  selectedNotifications: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Clear notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = initialState.pagination;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Select notification
    selectNotification: (state, action) => {
      const notificationId = action.payload;
      if (state.selectedNotifications.includes(notificationId)) {
        state.selectedNotifications = state.selectedNotifications.filter(id => id !== notificationId);
      } else {
        state.selectedNotifications.push(notificationId);
      }
    },
    
    // Select all notifications
    selectAllNotifications: (state) => {
      if (state.selectedNotifications.length === state.notifications.length) {
        state.selectedNotifications = [];
      } else {
        state.selectedNotifications = state.notifications.map(n => n._id);
      }
    },
    
    // Clear selection
    clearSelection: (state) => {
      state.selectedNotifications = [];
    },
    
    // Add real-time notification
    addNotification: (state, action) => {
      const notification = action.payload;
      
      // Check if notification already exists to prevent duplicates
      const existingIndex = state.notifications.findIndex(n => n._id === notification._id);
      if (existingIndex === -1) {
        // Set default status if not provided
        const notificationWithDefaults = {
          ...notification,
          status: notification.status || 'unread',
          createdAt: notification.createdAt || new Date().toISOString()
        };
        
        state.notifications.unshift(notificationWithDefaults);
        state.unreadCount += 1;
        
        // Keep only the latest 100 notifications in memory
        if (state.notifications.length > 100) {
          state.notifications = state.notifications.slice(0, 100);
        }
        
        console.log('✅ Notification added to state:', notificationWithDefaults.title);
      } else {
        console.log('⚠️ Notification already exists, skipping duplicate');
      }
    },
    
    // Update notification in real-time
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n._id === id);
      if (index !== -1) {
        state.notifications[index] = { ...state.notifications[index], ...updates };
      }
    },
    
    // Remove notification in real-time
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(n => n._id !== notificationId);
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.notifications;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch notifications';
      })
      
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = action.payload.notification;
        const index = state.notifications.findIndex(n => n._id === notification._id);
        if (index !== -1) {
          state.notifications[index] = notification;
        }
        if (notification.status === 'read' && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({
          ...n,
          status: 'read',
          readAt: new Date().toISOString()
        }));
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload.notification._id;
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
        state.selectedNotifications = state.selectedNotifications.filter(id => id !== notificationId);
      })
      
      // Archive notification
      .addCase(archiveNotification.fulfilled, (state, action) => {
        const notification = action.payload.notification;
        const index = state.notifications.findIndex(n => n._id === notification._id);
        if (index !== -1) {
          state.notifications[index] = notification;
        }
      })
      
      // Bulk action
      .addCase(bulkAction.fulfilled, (state, action) => {
        const { action: actionType } = action.meta.arg;
        
        if (actionType === 'delete') {
          state.notifications = state.notifications.filter(
            n => !action.meta.arg.notificationIds.includes(n._id)
          );
        } else if (actionType === 'mark_read') {
          state.notifications = state.notifications.map(n => {
            if (action.meta.arg.notificationIds.includes(n._id)) {
              return { ...n, status: 'read', readAt: new Date().toISOString() };
            }
            return n;
          });
        } else if (actionType === 'archive') {
          state.notifications = state.notifications.map(n => {
            if (action.meta.arg.notificationIds.includes(n._id)) {
              return { ...n, status: 'archived', archivedAt: new Date().toISOString() };
            }
            return n;
          });
        }
        
        state.selectedNotifications = [];
      })
      
      // Get notification stats
      .addCase(getNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })
      
      // Create test notification
      .addCase(createTestNotification.fulfilled, (state, action) => {
        const notification = action.payload.notification;
        state.notifications.unshift(notification);
        state.unreadCount += 1;
      });
  }
});

export const {
  clearNotifications,
  setFilters,
  selectNotification,
  selectAllNotifications,
  clearSelection,
  addNotification,
  updateNotification,
  removeNotification,
  clearError
} = notificationSlice.actions;

export default notificationSlice.reducer;
