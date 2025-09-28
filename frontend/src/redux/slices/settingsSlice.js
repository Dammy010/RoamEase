import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async thunks for settings management
export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put("/settings/settings", settingsData);
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getSettings = createAsyncThunk(
  "settings/getSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/settings");
      return response.data;
    } catch (error) {
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
        state.notifications = {
          ...state.notifications,
          ...action.payload.notifications,
        };
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
        state.notifications = {
          ...state.notifications,
          ...action.payload.notifications,
        };
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
} = settingsSlice.actions;
export default settingsSlice.reducer;
