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

const bidSlice = createSlice({
  name: 'bid',
  initialState: {
    bids: [],
    myBids: [],
    loading: false,
    error: null,
  },
  reducers: {
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
      })
      .addCase(fetchBidsOnMyShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bids = [];
      });
  },
});

export default bidSlice.reducer;
