import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import shipmentReducer from './slices/shipmentSlice';
import chatReducer from './slices/chatSlice';
import adminReducer from './slices/adminSlice';
import paymentReducer from './slices/paymentSlice';
import bidReducer from './slices/bidSlice';
import logisticsReducer from './slices/logisticsSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    shipment: shipmentReducer,
    chat: chatReducer,
    admin: adminReducer,
    payment: paymentReducer,
    bid: bidReducer,
    logistics: logisticsReducer,
  },
});
