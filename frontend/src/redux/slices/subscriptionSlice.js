import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscriptions/create', subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const confirmSubscription = createAsyncThunk(
  'subscription/confirmSubscription',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscriptions/confirm', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm subscription');
    }
  }
);

export const getUserSubscriptions = createAsyncThunk(
  'subscription/getUserSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/subscriptions/my-subscriptions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    subscriptions: [],
    currentSubscription: null,
    loading: false,
    error: null,
    paymentLoading: false,
    paymentError: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
    setCurrentSubscription: (state, action) => {
      state.currentSubscription = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentSubscription = action.payload.data.subscription;
        state.subscriptions.unshift(action.payload.data.subscription);
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
      })
      
      // Confirm subscription
      .addCase(confirmSubscription.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(confirmSubscription.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentSubscription = action.payload.data;
        // Update the subscription in the list
        const index = state.subscriptions.findIndex(
          sub => sub._id === action.payload.data._id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload.data;
        }
      })
      .addCase(confirmSubscription.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
      })
      
      // Get user subscriptions
      .addCase(getUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload.data;
        // Set current active subscription
        const activeSubscription = action.payload.data.find(sub => sub.status === 'active');
        state.currentSubscription = activeSubscription || null;
      })
      .addCase(getUserSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        // Update the subscription in the list
        const index = state.subscriptions.findIndex(
          sub => sub._id === action.payload.data._id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload.data;
        }
        // Clear current subscription if it was cancelled
        if (state.currentSubscription?._id === action.payload.data._id) {
          state.currentSubscription = null;
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
