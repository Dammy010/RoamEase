import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for settings management
export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/settings', settingsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateNotifications = createAsyncThunk(
  'settings/updateNotifications',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/notification-preferences', notificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePrivacy = createAsyncThunk(
  'settings/updatePrivacy',
  async (privacyData, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/privacy-settings', privacyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getSettings = createAsyncThunk(
  'settings/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/settings/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'settings/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.post('/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeProfilePicture = createAsyncThunk(
  'settings/removeProfilePicture',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/auth/profile-picture');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    settings: {
      theme: 'light',
      currency: 'USD',
      language: 'en',
      timezone: 'UTC'
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      security: true,
      updates: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: true,
      showPhone: false,
      showLocation: true
    },
    loading: false,
    error: null,
    updateLoading: false
  },
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    setTheme: (state, action) => {
      state.settings.theme = action.payload;
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', action.payload);
      localStorage.setItem('theme', action.payload);
    },
    setCurrency: (state, action) => {
      state.settings.currency = action.payload;
      localStorage.setItem('currency', action.payload);
    },
    updateNotificationPreference: (state, action) => {
      const { key, value } = action.payload;
      state.notifications[key] = value;
    },
    updatePrivacyPreference: (state, action) => {
      const { key, value } = action.payload;
      state.privacy[key] = value;
    },
    initializeSettings: (state) => {
      // Initialize from localStorage
      const savedTheme = localStorage.getItem('theme');
      const savedCurrency = localStorage.getItem('currency');
      
      if (savedTheme) {
        state.settings.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
      
      if (savedCurrency) {
        state.settings.currency = savedCurrency;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.settings = { ...state.settings, ...action.payload.settings };
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Update Notifications
      .addCase(updateNotifications.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateNotifications.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.notifications = { ...state.notifications, ...action.payload.notifications };
        state.error = null;
      })
      .addCase(updateNotifications.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Update Privacy
      .addCase(updatePrivacy.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updatePrivacy.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.privacy = { ...state.privacy, ...action.payload.privacy };
        state.error = null;
      })
      .addCase(updatePrivacy.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Get Settings
      .addCase(getSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = { ...state.settings, ...action.payload.settings };
        state.notifications = { ...state.notifications, ...action.payload.notifications };
        state.privacy = { ...state.privacy, ...action.payload.privacy };
        state.error = null;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update the user profile picture in the auth state
        // This will be handled by the auth slice
        state.error = null;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Remove Profile Picture
      .addCase(removeProfilePicture.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(removeProfilePicture.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update the user profile picture in the auth state
        // This will be handled by the auth slice
        state.error = null;
      })
      .addCase(removeProfilePicture.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearSettingsError, 
  setTheme, 
  setCurrency, 
  updateNotificationPreference, 
  updatePrivacyPreference,
  initializeSettings 
} = settingsSlice.actions;
export default settingsSlice.reducer;
