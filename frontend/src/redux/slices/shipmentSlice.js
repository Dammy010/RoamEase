import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

// --- Async Thunks ---
// Post shipment
export const postShipment = createAsyncThunk(
  'shipment/post',
  async (data, thunkAPI) => {
    try {
      const res = await api.post('/shipments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Shipment posted successfully');
      return res.data; // { success, shipment }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to post shipment';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch user shipments (active/open)
export const fetchUserShipments = createAsyncThunk(
  'shipment/fetchUser',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/shipments');
      return res.data; // { success, shipments }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch shipments';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Fetch shipment history
export const fetchShipmentHistory = createAsyncThunk(
  'shipment/fetchHistory',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/shipments/history');
      return res.data; // { success, history }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch shipment history';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchShipmentById = createAsyncThunk(
  'shipment/fetchById',
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/shipments/${id}`);
      return res.data; // { success, shipment }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch shipment';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateShipmentStatus = createAsyncThunk(
  'shipment/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const res = await api.put(`/shipments/${id}/status`, { status });
      toast.success('Shipment status updated successfully');
      return res.data; // { success, shipment }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update shipment status';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// New: Fetch open shipments not created by the current user (for carriers to bid on)
export const fetchAvailableShipments = createAsyncThunk(
  'shipment/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/shipments/available-for-bidding'); // Corrected: removed extra /api
      return response.data.shipments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Public: Fetch open shipments (no authentication required)
export const fetchPublicOpenShipments = createAsyncThunk(
  'shipment/fetchPublicOpen',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/shipments/public/open-shipments');
      return response.data.shipments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// New: Fetch full shipment details by ID (for viewing complete information)
export const fetchShipmentDetailsById = createAsyncThunk(
  'shipment/fetchDetailsById',
  async (shipmentId, thunkAPI) => {
    try {
      console.log("DEBUG: fetchShipmentDetailsById - Dispatching for shipmentId:", shipmentId);
      const res = await api.get(`/shipments/${shipmentId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log("DEBUG: fetchShipmentDetailsById - API response data:", res.data);
      return res.data; // { success, shipment }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch shipment details';
      console.error("ERROR: fetchShipmentDetailsById - API call failed:", message, err.response?.data);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Removed: markShipmentAsDeliveredAndRate (replaced with separate rate and deliver actions)

// New: Mark shipment as delivered by logistics company
export const markShipmentAsDeliveredByLogistics = createAsyncThunk(
  'shipment/markAsDeliveredByLogistics',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/shipments/${id}/mark-delivered-by-logistics`);
      return res.data.shipment;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to mark shipment as delivered by logistics.';
      return rejectWithValue(message);
    }
  }
);

// New: Mark shipment as delivered by user
export const markShipmentAsDeliveredByUser = createAsyncThunk(
  'shipment/markAsDeliveredByUser',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/shipments/${id}/mark-delivered-by-user`);
      return res.data.shipment;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to mark shipment as delivered.';
      return rejectWithValue(message);
    }
  }
);

// Rate a completed shipment
export const rateCompletedShipment = createAsyncThunk(
  'shipment/rateCompleted',
  async ({ id, rating, feedback }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/shipments/${id}/rate`, { rating, feedback });
      toast.success('Rating submitted successfully!');
      return res.data.shipment;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit rating.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Fetch delivered shipments (completed shipments that can be rated)
export const fetchDeliveredShipments = createAsyncThunk(
  'shipment/fetchDelivered',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/shipments/delivered');
      return res.data.shipments || [];
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch delivered shipments.';
      return rejectWithValue(message);
    }
  }
);

// Delete shipment
export const deleteShipment = createAsyncThunk(
  'shipment/delete',
  async (shipmentId, thunkAPI) => {
    try {
      const res = await api.delete(`/shipments/${shipmentId}`);
      toast.success('Shipment deleted successfully');
      return { shipmentId, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete shipment';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Slice ---
const shipmentSlice = createSlice({
  name: 'shipment',
  initialState: {
    shipments: [], // For user's own shipments
    history: [],
    deliveredShipments: [], // For completed shipments that can be rated
    currentShipment: null,
    availableShipments: [], // For shipments available for carriers to bid on
    loading: false,
    error: null,
    success: false,
    userInfo: null, // Placeholder for user information, if needed for real-time logic
  },
  reducers: {
    resetShipmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentShipment = null;
      state.availableShipments = [];
      state.shipments = [];
      state.history = [];
    },
    // New: Reducers for Socket.io real-time updates
    addShipmentRealtime: (state, { payload }) => {
      // Add to user's shipments if it's their own
      if (state.shipments.some(s => s._id === payload._id)) {
        // Already exists, do nothing or update if needed (handled by updateShipmentRealtime)
      } else if (payload.user && state.userInfo && payload.user._id === state.userInfo._id) { // Assuming userInfo is available in state for context
        state.shipments.unshift(payload);
      }
      
      // Add to available shipments if it's open and not their own
      if (payload.status === 'open' && (!state.userInfo || payload.user._id !== state.userInfo._id)) {
        if (!state.availableShipments.some(s => s._id === payload._id)) {
            state.availableShipments.unshift(payload);
        }
      }
    },
    updateShipmentRealtime: (state, { payload }) => {
      // Update in user's shipments
      let index = state.shipments.findIndex(s => s._id === payload._id);
      if (index !== -1) {
        state.shipments[index] = payload;
      }

      // Update in history
      index = state.history.findIndex(s => s._id === payload._id);
      if (index !== -1) {
        state.history[index] = payload;
      } else if (['completed', 'delivered', 'returned'].includes(payload.status) && payload.user && state.userInfo && payload.user._id === state.userInfo._id) {
          state.history.unshift(payload); // Add to history if it wasn't there and now qualifies
          state.shipments = state.shipments.filter(s => s._id !== payload._id); // Remove from active shipments
      }

      // Update in current shipment if it's the one being viewed
      if (state.currentShipment && state.currentShipment._id === payload._id) {
        state.currentShipment = payload;
      }

      // Update in available shipments (remove if no longer open, or update)
      index = state.availableShipments.findIndex(s => s._id === payload._id);
      if (index !== -1) {
        if (payload.status !== 'open' || (state.userInfo && payload.user._id === state.userInfo._id)) {
          state.availableShipments.splice(index, 1); // Remove if no longer open or if it's the user's own
        } else {
          state.availableShipments[index] = payload;
        }
      } else if (payload.status === 'open' && (!state.userInfo || payload.user._id !== state.userInfo._id)) {
        state.availableShipments.unshift(payload); // Add if it's now available for bidding
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Post Shipment ---
      .addCase(postShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(postShipment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        if (payload?.shipment) {
          state.shipments.unshift(payload.shipment); // add new shipment to top
        }
      })
      .addCase(postShipment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
      })

      // --- Fetch User Shipments ---
      .addCase(fetchUserShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.shipments = Array.isArray(payload?.shipments)
          ? payload.shipments
          : [];
      })
      .addCase(fetchUserShipments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // --- Fetch Shipment History ---
      .addCase(fetchShipmentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.history = Array.isArray(payload?.history)
          ? payload.history
          : [];
      })
      .addCase(fetchShipmentHistory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // --- Fetch Shipment By ID ---
      .addCase(fetchShipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.currentShipment = null;
      })
      .addCase(fetchShipmentById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.currentShipment = payload?.shipment || null;
      })
      .addCase(fetchShipmentById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
        state.currentShipment = null;
      })

      // --- Update Shipment Status ---
      .addCase(updateShipmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateShipmentStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        if (payload?.shipment) {
          // Update the shipment in the shipments list if it exists
          const index = state.shipments.findIndex(s => s._id === payload.shipment._id);
          if (index !== -1) {
            state.shipments[index] = payload.shipment;
          }
          // If the updated shipment is the current one, update it
          if (state.currentShipment && state.currentShipment._id === payload.shipment._id) {
            state.currentShipment = payload.shipment;
          }
        }
      })
      .addCase(updateShipmentStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
      })

      // --- Fetch Available Shipments For Carrier (now using fetchAvailableShipments) ---
      .addCase(fetchAvailableShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.availableShipments = Array.isArray(payload)
          ? payload
          : [];
      })
      .addCase(fetchAvailableShipments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // --- Fetch Public Open Shipments ---
      .addCase(fetchPublicOpenShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicOpenShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.availableShipments = Array.isArray(payload)
          ? payload
          : [];
      })
      .addCase(fetchPublicOpenShipments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // --- Fetch Shipment Details By ID ---
      .addCase(fetchShipmentDetailsById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.currentShipment = null;
      })
      .addCase(fetchShipmentDetailsById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.currentShipment = payload?.shipment || null;
      })
      .addCase(fetchShipmentDetailsById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
        state.currentShipment = null;
      })

      // Removed: markShipmentAsDeliveredAndRate reducer cases (replaced with separate actions)

      // --- Mark Shipment As Delivered By Logistics ---
      .addCase(markShipmentAsDeliveredByLogistics.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(markShipmentAsDeliveredByLogistics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        // Update in available shipments if it exists
        const index = state.availableShipments.findIndex(s => s._id === payload._id);
        if (index !== -1) {
          state.availableShipments[index] = payload;
        }
        // Update in current shipment if it's the one being viewed
        if (state.currentShipment && state.currentShipment._id === payload._id) {
          state.currentShipment = payload;
        }
      })
      .addCase(markShipmentAsDeliveredByLogistics.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
      })

      // --- Mark Shipment As Delivered By User ---
      .addCase(markShipmentAsDeliveredByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(markShipmentAsDeliveredByUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        // Update in user's shipments
        const index = state.shipments.findIndex(s => s._id === payload._id);
        if (index !== -1) {
          state.shipments[index] = payload;
        }
        // Update in history
        const historyIndex = state.history.findIndex(s => s._id === payload._id);
        if (historyIndex !== -1) {
          state.history[historyIndex] = payload;
        }
        // Update in current shipment if it's the one being viewed
        if (state.currentShipment && state.currentShipment._id === payload._id) {
          state.currentShipment = payload;
        }
      })
      .addCase(markShipmentAsDeliveredByUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
      })

      // --- Rate Completed Shipment ---
      .addCase(rateCompletedShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(rateCompletedShipment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        // Update in user's shipments
        const index = state.shipments.findIndex(s => s._id === payload._id);
        if (index !== -1) {
          state.shipments[index] = payload;
        }
        // Update in history
        const historyIndex = state.history.findIndex(s => s._id === payload._id);
        if (historyIndex !== -1) {
          state.history[historyIndex] = payload;
        }
        // Update in current shipment if it's the one being viewed
        if (state.currentShipment && state.currentShipment._id === payload._id) {
          state.currentShipment = payload;
        }
      })
      .addCase(rateCompletedShipment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
      })

      // --- Fetch Delivered Shipments ---
      .addCase(fetchDeliveredShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveredShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.deliveredShipments = payload;
        state.error = null;
      })
      .addCase(fetchDeliveredShipments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.deliveredShipments = [];
      })
      // --- Delete Shipment ---
      .addCase(deleteShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShipment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        // Remove from user's shipments
        state.shipments = state.shipments.filter(s => s._id !== payload.shipmentId);
        // Remove from history
        state.history = state.history.filter(s => s._id !== payload.shipmentId);
        // Clear current shipment if it's the one being deleted
        if (state.currentShipment && state.currentShipment._id === payload.shipmentId) {
          state.currentShipment = null;
        }
        // Remove from available shipments
        state.availableShipments = state.availableShipments.filter(s => s._id !== payload.shipmentId);
      })
      .addCase(deleteShipment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
      });
  },
});

// Export all actions and thunks
export const { resetShipmentState, addShipmentRealtime, updateShipmentRealtime } = shipmentSlice.actions;
export default shipmentSlice.reducer;
