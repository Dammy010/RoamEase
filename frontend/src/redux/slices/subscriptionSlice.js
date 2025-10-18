import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async thunks
export const createSubscription = createAsyncThunk(
  "subscription/createSubscription",
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/subscriptions/create",
        subscriptionData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subscription"
      );
    }
  }
);

export const confirmSubscription = createAsyncThunk(
  "subscription/confirmSubscription",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/subscriptions/confirm", paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm subscription"
      );
    }
  }
);

export const getUserSubscriptions = createAsyncThunk(
  "subscription/getUserSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/subscriptions/my-subscriptions");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancelSubscription",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/subscriptions/${subscriptionId}/cancel`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    }
  }
);

export const upgradeSubscription = createAsyncThunk(
  "subscription/upgradeSubscription",
  async (upgradeData, { rejectWithValue }) => {
    try {
      const response = await api.post("/subscriptions/upgrade", upgradeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upgrade subscription"
      );
    }
  }
);

export const getAllSubscriptions = createAsyncThunk(
  "subscription/getAllSubscriptions",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/subscriptions/all?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    subscriptions: [],
    currentSubscription: null,
    loading: false,
    error: null,
    paymentLoading: false,
    paymentError: null,
    // Admin subscription management
    allSubscriptions: [],
    adminLoading: false,
    adminError: null,
    subscriptionSummary: null,
    pagination: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
      state.adminError = null;
    },
    setCurrentSubscription: (state, action) => {
      state.currentSubscription = action.payload;
    },
    clearState: (state) => {
      state.subscriptions = [];
      state.currentSubscription = null;
      state.loading = false;
      state.error = null;
      state.paymentLoading = false;
      state.paymentError = null;
    },
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
        if (action.payload?.data) {
          state.currentSubscription = action.payload.data;
          // Update the subscription in the list
          const index = state.subscriptions.findIndex(
            (sub) => sub && sub._id === action.payload.data._id
          );
          if (index !== -1) {
            state.subscriptions[index] = action.payload.data;
          }
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
        const activeSubscription = action.payload.data.find(
          (sub) => sub.status === "active"
        );
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
        if (action.payload?.data) {
          // Update the subscription in the list
          const index = state.subscriptions.findIndex(
            (sub) => sub && sub._id === action.payload.data._id
          );
          if (index !== -1) {
            state.subscriptions[index] = action.payload.data;
          }
          // Clear current subscription if it was cancelled
          if (state.currentSubscription?._id === action.payload.data._id) {
            state.currentSubscription = null;
          }
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upgrade subscription
      .addCase(upgradeSubscription.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        state.paymentLoading = false;
        // Add the new upgrade subscription to the list
        if (action.payload?.data?.subscription) {
          state.subscriptions.unshift(action.payload.data.subscription);
          // Update current subscription to the new one
          state.currentSubscription = action.payload.data.subscription;
        }
      })
      .addCase(upgradeSubscription.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
      })

      // Get all subscriptions (admin)
      .addCase(getAllSubscriptions.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getAllSubscriptions.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.allSubscriptions = action.payload.data.subscriptions;
        state.subscriptionSummary = action.payload.data.summary;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getAllSubscriptions.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      });
  },
});

export const { clearError, setCurrentSubscription, clearState } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
