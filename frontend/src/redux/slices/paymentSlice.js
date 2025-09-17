import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Initialize payment with Paystack
export const initializePayment = createAsyncThunk(
  'payment/initialize',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/initialize', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize payment');
    }
  }
);

// Verify payment with Paystack
export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (reference, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/verify', { reference });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

// Get payment history
export const getPaymentHistory = createAsyncThunk(
  'payment/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    payments: [],
    currentPayment: null,
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
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize payment
      .addCase(initializePayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
      })
      
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        if (action.payload.success) {
          toast.success('Payment successful!');
        } else {
          toast.error('Payment failed');
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
        toast.error(action.payload || 'Payment verification failed');
      })
      
      // Get payment history
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;