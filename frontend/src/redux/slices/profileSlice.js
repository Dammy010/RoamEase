import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for profile management
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.post('/profile/upload-profile-picture', formData, {
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

export const deleteAccount = createAsyncThunk(
  'profile/deleteAccount',
  async (password, { rejectWithValue }) => {
    try {
      const response = await api.delete('/profile/delete-account', {
        data: { password }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getProfileStats = createAsyncThunk(
  'profile/getProfileStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/profile/profile-stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profileData: null,
    stats: {
      totalShipments: 0,
      completedShipments: 0,
      rating: 0,
      responseTime: '0 hours',
      successRate: 0
    },
    loading: false,
    error: null,
    updateLoading: false,
    passwordLoading: false,
    uploadLoading: false,
    deleteLoading: false
  },
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    setProfileData: (state, action) => {
      state.profileData = action.payload;
    },
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.profileData) {
        state.profileData[field] = value;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profileData = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload;
      })
      
      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.uploadLoading = false;
        if (state.profileData) {
          state.profileData.profilePicture = action.payload.profilePicture;
        }
        state.error = null;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      })
      
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.deleteLoading = false;
        state.profileData = null;
        state.stats = {
          totalShipments: 0,
          completedShipments: 0,
          rating: 0,
          responseTime: '0 hours',
          successRate: 0
        };
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      
      // Get Profile Stats
      .addCase(getProfileStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfileStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(getProfileStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProfileError, setProfileData, updateProfileField } = profileSlice.actions;
export default profileSlice.reducer;
