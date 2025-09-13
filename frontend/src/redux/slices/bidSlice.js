import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Create a bid
export const createBid = createAsyncThunk(
  'bid/createBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bids', bidData); // Corrected: removed extra /api
      return response.data; // The created bid
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch bids for a specific shipment (for shipper/admin)
export const fetchBidsForShipment = createAsyncThunk(
  'bid/fetchBidsForShipment',
  async (shipmentId, { rejectWithValue }) => {
    try {
      console.log("DEBUG: fetchBidsForShipment - Dispatching for shipmentId:", shipmentId);
      const response = await api.get(`/bids/shipment/${shipmentId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log("DEBUG: fetchBidsForShipment - API response data:", response.data);
      return response.data; // Array of bids
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      console.error("ERROR: fetchBidsForShipment - API call failed:", message, error.response?.data);
      return rejectWithValue(message);
    }
  }
);

// Accept a bid
export const acceptBid = createAsyncThunk(
  'bid/acceptBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bids/${bidId}/accept`); // Corrected: removed extra /api
      return response.data; // The accepted bid
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Reject a bid
export const rejectBid = createAsyncThunk(
  'bid/rejectBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bids/${bidId}/reject`); // Corrected: removed extra /api
      return response.data; // The rejected bid
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch bids made by the logged-in carrier/logistics
export const fetchMyBids = createAsyncThunk(
  'bid/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bids/my-bids'); // Corrected: removed extra /api
      return response.data; // Array of bids
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch all bids for shipments posted by the logged-in user (shipper)
export const fetchBidsOnMyShipments = createAsyncThunk(
  'bid/fetchBidsOnMyShipments',
  async (_, { rejectWithValue }) => {
    try {
      console.log("DEBUG: fetchBidsOnMyShipments - Dispatching API call to /bids/on-my-shipments");
      const response = await api.get('/bids/on-my-shipments', { 
        headers: {
          'Cache-Control': 'no-cache', // Prevent caching
          'Pragma': 'no-cache', // For older HTTP/1.0 caches
          'Expires': '0' // For older HTTP/1.0 caches
        }
      });
      console.log("DEBUG: fetchBidsOnMyShipments - API response data:", response.data);
      return response.data; // Array of bids
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      console.error("ERROR: fetchBidsOnMyShipments - API call failed:", message, error.response?.data);
      return rejectWithValue(message);
    }
  }
);

// Cancel/Delete a bid (for logistics companies)
export const cancelBid = createAsyncThunk(
  'bid/cancelBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/bids/${bidId}`);
      return { bidId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update a bid (for logistics companies)
export const updateBid = createAsyncThunk(
  'bid/updateBid',
  async ({ bidId, bidData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bids/${bidId}`, bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const bidSlice = createSlice({
  name: 'bid',
  initialState: {
    bids: [],
    myBids: [],
    loading: false,
    error: null,
    bidsViewed: false, // Track if user has viewed the bids page
  },
  reducers: {
    // Mark bids as viewed when user visits manage bids page
    markBidsAsViewed: (state) => {
      console.log('🧹 Marking bids as viewed');
      state.bidsViewed = true;
    },
    // Can add local reducers if needed for real-time updates or local state management
  },
  extraReducers: (builder) => {
    builder
      // Create Bid
      .addCase(createBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.loading = false;
        // Add new bid to myBids if it's a logistics user
        state.myBids.unshift(action.payload);
      })
      .addCase(createBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Bids For Shipment
      .addCase(fetchBidsForShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidsForShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBidsForShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bids = [];
      })

      // Accept Bid
      .addCase(acceptBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptBid.fulfilled, (state, action) => {
        state.loading = false;
        // Update the status of the accepted bid in the bids array
        const index = state.bids.findIndex(bid => bid._id === action.payload._id);
        if (index !== -1) {
          state.bids[index] = action.payload;
        }
        // Update the status of the accepted bid in the myBids array
        const myBidIndex = state.myBids.findIndex(bid => bid._id === action.payload._id);
        if (myBidIndex !== -1) {
          state.myBids[myBidIndex] = action.payload;
        }
      })
      .addCase(acceptBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reject Bid
      .addCase(rejectBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectBid.fulfilled, (state, action) => {
        state.loading = false;
        // Update the status of the rejected bid in the bids array
        const index = state.bids.findIndex(bid => bid._id === action.payload._id);
        if (index !== -1) {
          state.bids[index] = action.payload;
        }
        // Update the status of the rejected bid in the myBids array
        const myBidIndex = state.myBids.findIndex(bid => bid._id === action.payload._id);
        if (myBidIndex !== -1) {
          state.myBids[myBidIndex] = action.payload;
        }
      })
      .addCase(rejectBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch My Bids
      .addCase(fetchMyBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.loading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.myBids = [];
      })

      // Fetch Bids On My Shipments
      .addCase(fetchBidsOnMyShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidsOnMyShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload; // Store in bids array
        // Reset viewed flag when new bids are fetched
        state.bidsViewed = false;
      })
      .addCase(fetchBidsOnMyShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bids = [];
      })

      // Cancel Bid
      .addCase(cancelBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBid.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the cancelled bid from myBids array
        state.myBids = state.myBids.filter(bid => bid._id !== action.payload.bidId);
        // Also remove from bids array if it exists there
        state.bids = state.bids.filter(bid => bid._id !== action.payload.bidId);
      })
      .addCase(cancelBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Bid
      .addCase(updateBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBid.fulfilled, (state, action) => {
        state.loading = false;
        // Update the bid in myBids array
        const updatedBid = action.payload;
        state.myBids = state.myBids.map(bid => 
          bid._id === updatedBid._id ? updatedBid : bid
        );
        // Also update in bids array if it exists there
        state.bids = state.bids.map(bid => 
          bid._id === updatedBid._id ? updatedBid : bid
        );
      })
      .addCase(updateBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { markBidsAsViewed } = bidSlice.actions;
export default bidSlice.reducer;
