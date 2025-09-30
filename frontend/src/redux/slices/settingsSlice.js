import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ---------------- Cache Management ----------------
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = {
  settings: {
    data: null,
    timestamp: null,
    isFetching: false,
  },
};

// Helper function to check if cache is valid
const isCacheValid = (cacheKey) => {
  const cached = cache[cacheKey];
  if (!cached || !cached.data || !cached.timestamp) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
};

// Helper function to set cache
const setCache = (cacheKey, data) => {
  cache[cacheKey] = {
    data,
    timestamp: Date.now(),
    isFetching: false,
  };
};

// Helper function to clear cache
const clearSettingsCache = (cacheKey) => {
  if (cacheKey) {
    cache[cacheKey] = { data: null, timestamp: null, isFetching: false };
  } else {
    Object.keys(cache).forEach((key) => {
      cache[key] = { data: null, timestamp: null, isFetching: false };
    });
  }
};

// Async thunks for settings management
export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put("/settings/settings", settingsData);
      // Clear cache after update
      clearSettingsCache("settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateNotifications = createAsyncThunk(
  "settings/updateNotifications",
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await api.put(
        "/settings/notifications",
        notificationData
      );
      // Clear cache after update
      clearSettingsCache("settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePrivacy = createAsyncThunk(
  "settings/updatePrivacy",
  async (privacyData, { rejectWithValue }) => {
    try {
      const response = await api.put("/settings/privacy", privacyData);
      // Clear cache after update
      clearSettingsCache("settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Settings - WITH CACHING AND DUPLICATE PREVENTION
export const getSettings = createAsyncThunk(
  "settings/getSettings",
  async (_, { rejectWithValue }) => {
    try {
      // Check if we already have valid cached data
      if (isCacheValid("settings")) {
        console.log("📦 Using cached settings data");
        return cache.settings.data;
      }

      // Check if we're already fetching
      if (cache.settings.isFetching) {
        console.log("⏳ Settings fetch already in progress, waiting...");
        // Wait for the current fetch to complete
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!cache.settings.isFetching) {
              clearInterval(checkInterval);
              if (cache.settings.data) {
                resolve(cache.settings.data);
              } else {
                reject(new Error("Settings fetch failed"));
              }
            }
          }, 100);
        });
      }

      // Mark as fetching
      cache.settings.isFetching = true;
      console.log("🌐 Fetching fresh settings data from API");

      const response = await api.get("/settings");

      // Cache the result
      setCache("settings", response.data);

      return response.data;
    } catch (error) {
      // Reset fetching flag on error
      cache.settings.isFetching = false;
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  "settings/uploadProfilePicture",
  async (file, { rejectWithValue }) => {
    try {
      // Client-side file size validation (10MB limit)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        return rejectWithValue(
          "Your file is too large. Please upload an image under 10MB."
        );
      }

      const formData = new FormData();
      formData.append("profilePicture", file);
      const response = await api.post(
        "/profile/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Clear settings cache since profile picture affects settings
      clearSettingsCache("settings");

      return response.data;
    } catch (error) {
      console.error("❌ Redux: Upload error:", error);
      console.error("❌ Redux: Error response:", error.response?.data);
      console.error("❌ Redux: Error status:", error.response?.status);
      console.error("❌ Redux: Error headers:", error.response?.headers);

      // Handle specific error cases
      if (error.response?.status === 413) {
        return rejectWithValue(
          "Your file is too large. Please upload an image under 10MB."
        );
      }

      // Return the server's error message or a fallback
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeProfilePicture = createAsyncThunk(
  "settings/removeProfilePicture",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/auth/profile-picture");
      // Clear settings cache since profile picture affects settings
      clearSettingsCache("settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "settings/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      console.log("🔐 Redux: Sending password change request:", {
        hasCurrentPassword: !!passwordData.currentPassword,
        hasNewPassword: !!passwordData.newPassword,
        currentPasswordLength: passwordData.currentPassword?.length,
        newPasswordLength: passwordData.newPassword?.length,
      });

      const response = await api.put("/profile/change-password", passwordData);
      console.log("✅ Redux: Password change successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Redux: Password change error:", error);
      console.error("❌ Redux: Error response:", error.response?.data);
      console.error("❌ Redux: Error status:", error.response?.status);
      console.error("❌ Redux: Error headers:", error.response?.headers);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "settings/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put("/profile/profile", profileData);
      // Clear settings cache since profile affects settings
      clearSettingsCache("settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Push notification functions removed - service no longer available

export const testNotificationPreferences = createAsyncThunk(
  "settings/testNotificationPreferences",
  async ({ type, channel }, { rejectWithValue }) => {
    try {
      const response = await api.post("/settings/test-notification", {
        type,
        channel,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: {
      currency: "USD",
      language: "en",
      timezone: "UTC",
    },
    notifications: {
      email: true,
      marketing: false,
      security: true,
      updates: true,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: true,
      showPhone: false,
      showLocation: true,
    },
    loading: false,
    error: null,
    updateLoading: false,
    // Add cache status for debugging
    cacheStatus: {
      settings: {
        isValid: isCacheValid("settings"),
        lastFetched: cache.settings.timestamp,
      },
    },
  },
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    // Theme is now handled by ThemeProvider - removed setTheme reducer
    setCurrency: (state, action) => {
      state.settings.currency = action.payload;
      localStorage.setItem("currency", action.payload);
    },
    updateNotificationPreference: (state, action) => {
      const { key, value } = action.payload;
      state.notifications[key] = value;
      // Persist to localStorage
      localStorage.setItem(
        "notificationSettings",
        JSON.stringify(state.notifications)
      );
    },
    updatePrivacyPreference: (state, action) => {
      const { key, value } = action.payload;
      state.privacy[key] = value;
      // Persist to localStorage
      localStorage.setItem("privacySettings", JSON.stringify(state.privacy));
    },
    initializeSettings: (state) => {
      // Initialize from localStorage (theme is now handled by ThemeProvider)
      const savedCurrency = localStorage.getItem("currency");
      const savedNotifications = localStorage.getItem("notificationSettings");
      const savedPrivacy = localStorage.getItem("privacySettings");

      if (savedCurrency) {
        state.settings.currency = savedCurrency;
      }

      if (savedNotifications) {
        try {
          state.notifications = {
            ...state.notifications,
            ...JSON.parse(savedNotifications),
          };
        } catch (error) {
          console.error("Error parsing notification settings:", error);
        }
      }

      if (savedPrivacy) {
        try {
          state.privacy = { ...state.privacy, ...JSON.parse(savedPrivacy) };
        } catch (error) {
          console.error("Error parsing privacy settings:", error);
        }
      }
    },
    // Add action to manually clear cache (for debugging)
    clearCache: (state) => {
      clearSettingsCache();
      state.cacheStatus = {
        settings: {
          isValid: false,
          lastFetched: null,
        },
      };
    },
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
        // Update cache status
        state.cacheStatus.settings.isValid = isCacheValid("settings");
        state.cacheStatus.settings.lastFetched = cache.settings.timestamp;
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
        state.notifications = {
          ...state.notifications,
          ...action.payload.notifications,
        };
        state.error = null;
        // Update cache status
        state.cacheStatus.settings.isValid = isCacheValid("settings");
        state.cacheStatus.settings.lastFetched = cache.settings.timestamp;
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
        // Update cache status
        state.cacheStatus.settings.isValid = isCacheValid("settings");
        state.cacheStatus.settings.lastFetched = cache.settings.timestamp;
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
        state.notifications = {
          ...state.notifications,
          ...action.payload.notifications,
        };
        state.privacy = { ...state.privacy, ...action.payload.privacy };
        state.error = null;
        // Update cache status
        state.cacheStatus.settings.isValid = isCacheValid("settings");
        state.cacheStatus.settings.lastFetched = cache.settings.timestamp;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Update cache status
        state.cacheStatus.settings.isValid = false;
        state.cacheStatus.settings.lastFetched = null;
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
        // Update cache status
        state.cacheStatus.settings.isValid = isCacheValid("settings");
        state.cacheStatus.settings.lastFetched = cache.settings.timestamp;
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
        // Update cache status
        state.cacheStatus.settings.isValid = isCacheValid("settings");
        state.cacheStatus.settings.lastFetched = cache.settings.timestamp;
      })
      .addCase(removeProfilePicture.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.updateLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updateLoading = false;
        state.error = null;
        // Update cache status
        state.cacheStatus.settings.isValid = isCacheValid("settings");
        state.cacheStatus.settings.lastFetched = cache.settings.timestamp;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSettingsError,
  setCurrency,
  updateNotificationPreference,
  updatePrivacyPreference,
  initializeSettings,
  clearCache,
} = settingsSlice.actions;
export default settingsSlice.reducer;
