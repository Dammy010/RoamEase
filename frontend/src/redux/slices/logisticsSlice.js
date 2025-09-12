import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

  // Fetch logistics dashboard data
  export const fetchLogisticsDashboardData = createAsyncThunk(
    'logistics/fetchDashboardData',
    async (_, thunkAPI) => {
      try {
        // Fetch available shipments count
        const shipmentsResponse = await api.get('/shipments/available-for-bidding');
        console.log('🔍 Available shipments API response:', shipmentsResponse.data);
        const availableShipmentsCount = shipmentsResponse.data?.shipments?.length || shipmentsResponse.data?.length || 0;
        console.log('🔍 Available shipments count:', availableShipmentsCount);
        
        // Fetch user's bids count
        const bidsResponse = await api.get('/bids/my-bids');
        console.log('🔍 My bids API response:', bidsResponse.data);
        const myBidsCount = bidsResponse.data?.length || 0;
        console.log('🔍 My bids count:', myBidsCount);
        
        // Fetch user's active shipments count (using the correct endpoint)
        const activeShipmentsResponse = await api.get('/shipments/my-active-shipments');
        console.log('🔍 Active shipments API response:', activeShipmentsResponse.data);
        const activeShipmentsCount = activeShipmentsResponse.data?.shipments?.length || 0;
        console.log('🔍 Active shipments count:', activeShipmentsCount);
        
        return {
          availableShipments: availableShipmentsCount,
          myBids: myBidsCount,
          activeShipments: activeShipmentsCount
        };
      } catch (err) {
        console.error('Error fetching logistics dashboard data:', err);
        return thunkAPI.rejectWithValue(err.response?.data);
      }
    }
  );

  // Fetch logistics history
  export const fetchLogisticsHistory = createAsyncThunk(
    'logistics/fetchHistory',
    async (_, thunkAPI) => {
      try {
        const response = await api.get('/shipments/logistics-history');
        return response.data;
      } catch (err) {
        console.error('Error fetching logistics history:', err);
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
      }
    }
  );

const initialState = {
  dashboardData: {
    availableShipments: 0,
    myBids: 0,
    activeShipments: 0
  },
  history: [],
  historyLoading: false,
  historyError: null,
  loading: false,
  error: null
};

const logisticsSlice = createSlice({
  name: 'logistics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogisticsDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLogisticsDashboardData.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.dashboardData = payload;
      })
      .addCase(fetchLogisticsDashboardData.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch Logistics History
      .addCase(fetchLogisticsHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchLogisticsHistory.fulfilled, (state, { payload }) => {
        state.historyLoading = false;
        state.historyError = null;
        state.history = payload.history || [];
      })
      .addCase(fetchLogisticsHistory.rejected, (state, { payload }) => {
        state.historyLoading = false;
        state.historyError = payload;
        state.history = [];
      });
  }
});

export default logisticsSlice.reducer;
