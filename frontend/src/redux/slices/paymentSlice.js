import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const subscribeCompany = createAsyncThunk('payment/subscribe', async (data, thunkAPI) => {
  try {
    const res = await api.post('/payments/subscribe', data);
    toast.success('Subscription successful');
    return res.data;
  } catch (err) {
    toast.error('Subscription failed');
    return thunkAPI.rejectWithValue(err.response.data);
  }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    status: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(subscribeCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(subscribeCompany.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.status = payload.status;
      })
      .addCase(subscribeCompany.rejected, (state) => {
        state.loading = false;
        state.status = 'failed';
      });
  },
});

export default paymentSlice.reducer;