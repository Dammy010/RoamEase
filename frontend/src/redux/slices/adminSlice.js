import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

// --- Fetch all admin dashboard data in one request ---
export const fetchDashboardData = createAsyncThunk(
  'admin/fetchDashboardData',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/dashboard-summary');
      return res.data; // { users, logisticsPending, logisticsVerified, disputes, analytics }
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Fetch total users ---
export const fetchTotalUsers = createAsyncThunk(
  'admin/fetchTotalUsers',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/users/total');
      return res.data.totalUsers;
    } catch (err) {
      toast.error('Failed to fetch total users');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Fetch normal users count ---
export const fetchNormalUsersCount = createAsyncThunk(
  'admin/fetchNormalUsersCount',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/users/normal-count');
      return res.data.normalUsersCount;
    } catch (err) {
      toast.error('Failed to fetch normal users count');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Fetch all shipments ---
export const fetchAllShipments = createAsyncThunk(
  'admin/fetchAllShipments',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/shipments');
      return res.data.items;
    } catch (err) {
      toast.error('Failed to fetch all shipments');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Fetch all bids for admin ---
export const fetchAllBids = createAsyncThunk(
  'admin/fetchAllBids',
  async (shipmentId = null, thunkAPI) => {
    try {
      const url = shipmentId ? `/admin/bids?shipmentId=${shipmentId}` : '/admin/bids';
      const res = await api.get(url);
      return res.data.items;
    } catch (err) {
      toast.error('Failed to fetch bids');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Fetch all conversations for admin ---
export const fetchAllConversationsForAdmin = createAsyncThunk(
  'admin/fetchAllConversationsForAdmin',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/conversations');
      return res.data.items;
    } catch (err) {
      toast.error('Failed to fetch all conversations');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Fetch messages for a specific conversation for admin ---
export const fetchMessagesForAdmin = createAsyncThunk(
  'admin/fetchMessagesForAdmin',
  async (conversationId, thunkAPI) => {
    try {
      const res = await api.get(`/admin/conversations/${conversationId}/messages`);
      return res.data.messages;
    } catch (err) {
      toast.error('Failed to fetch messages for conversation');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Verify Logistics Company (Approve/Reject) ---
export const verifyLogistics = createAsyncThunk(
  'admin/verifyLogistics',
  async ({ id, action }, thunkAPI) => {
    try {
      const res = await api.patch(`/admin/users/${id}/verify`, { action });
      toast.success(`Company ${action}ed successfully`);
      return res.data; // updated company object
    } catch (err) {
      toast.error('Verification failed');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Delete User ---
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, thunkAPI) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      return userId;
    } catch (err) {
      toast.error('Failed to delete user');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Suspend/Activate User ---
export const suspendUser = createAsyncThunk(
  'admin/suspendUser',
  async ({ userId, newStatus }, thunkAPI) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/suspend`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      return res.data; // Should return the updated user object
    } catch (err) {
      toast.error('Failed to update user status');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Update User/Logistics Profile (Admin) ---
export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, thunkAPI) => {
    try {
      const res = await api.patch(`/admin/users/${userId}`, userData);
      toast.success('User profile updated successfully');
      return res.data.user; // Should return the updated user object
    } catch (err) {
      toast.error('Failed to update user profile');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Fetch All Disputes ---
export const fetchAllDisputes = createAsyncThunk(
  'admin/fetchAllDisputes',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/disputes');
      return res.data.items;
    } catch (err) {
      toast.error('Failed to fetch disputes');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// --- Resolve Dispute ---
export const resolveDispute = createAsyncThunk(
  'admin/resolveDispute',
  async ({ disputeId, status, adminNotes, resolution }, thunkAPI) => {
    try {
      const res = await api.patch(`/admin/disputes/${disputeId}/resolve`, {
        status,
        adminNotes,
        resolution
      });
      toast.success(`Dispute ${status === 'resolved' ? 'resolved' : 'updated'} successfully`);
      return res.data.dispute;
    } catch (err) {
      toast.error('Failed to update dispute');
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

const initialState = {
  users: [],
  disputes: [],
  analytics: null,
  logisticsPending: [],
  logisticsVerified: [],
  loading: false,
  error: null,
  totalUsers: 0,
  normalUsersCount: 0,
  allShipments: [],
  allBids: [],
  allConversations: [],
  currentAdminChatMessages: [],
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- fetchDashboardData ---
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null; // Clear any previous errors
        
        // Unconditionally update the state with the new payload
        state.users = payload.users || [];
        state.logisticsPending = payload.logisticsPending || [];
        state.logisticsVerified = payload.logisticsVerified || [];
        state.disputes = payload.disputes || [];
        state.analytics = payload.analytics || null;
      })
      .addCase(fetchDashboardData.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // --- fetchTotalUsers ---
      .addCase(fetchTotalUsers.fulfilled, (state, { payload }) => {
        state.totalUsers = payload;
      })

      // --- fetchNormalUsersCount ---
      .addCase(fetchNormalUsersCount.fulfilled, (state, { payload }) => {
        state.normalUsersCount = payload;
      })

      // --- fetchAllShipments ---
      .addCase(fetchAllShipments.fulfilled, (state, { payload }) => {
        state.allShipments = payload;
      })

      // --- fetchAllBids ---
      .addCase(fetchAllBids.fulfilled, (state, { payload }) => {
        state.allBids = payload;
      })

      // --- fetchAllConversationsForAdmin ---
      .addCase(fetchAllConversationsForAdmin.fulfilled, (state, { payload }) => {
        state.allConversations = payload;
      })

      // --- fetchMessagesForAdmin ---
      .addCase(fetchMessagesForAdmin.fulfilled, (state, { payload }) => {
        state.currentAdminChatMessages = payload;
      })

      // --- verifyLogistics ---
      .addCase(verifyLogistics.fulfilled, (state, { payload }) => {
        // remove from pending
        state.logisticsPending = state.logisticsPending.filter(
          (c) => c._id !== payload._id
        );

        // add to verified if applicable
        if (payload.verificationStatus === 'verified') {
          state.logisticsVerified.push(payload);
        }

        // update in users list
        const idx = state.users.findIndex((u) => u._id === payload._id);
        if (idx !== -1) {
          state.users[idx] = payload;
        } else {
          state.users.push(payload);
        }
      })
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        // Find and update the user in the main `users` array
        const userIndex = state.users.findIndex((user) => user._id === payload._id);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], ...payload };
        }

        // If the updated user is a logistics, update in relevant logistics lists
        if (payload.role === 'logistics') {
          const pendingIndex = state.logisticsPending.findIndex((user) => user._id === payload._id);
          if (pendingIndex !== -1) {
            state.logisticsPending[pendingIndex] = { ...state.logisticsPending[pendingIndex], ...payload };
          }

          const verifiedIndex = state.logisticsVerified.findIndex((user) => user._id === payload._id);
          if (verifiedIndex !== -1) {
            state.logisticsVerified[verifiedIndex] = { ...state.logisticsVerified[verifiedIndex], ...payload };
          }
        }
      })
      .addCase(suspendUser.fulfilled, (state, { payload }) => {
        const index = state.users.findIndex((user) => user._id === payload._id);
        if (index !== -1) {
          state.users[index].isActive = payload.isActive; // Update only isActive status
        }

        // Also update in logisticsPending/Verified lists if applicable
        const logisticsIndexPending = state.logisticsPending.findIndex((user) => user._id === payload._id);
        if (logisticsIndexPending !== -1) {
          state.logisticsPending[logisticsIndexPending].isActive = payload.isActive;
        }
        const logisticsIndexVerified = state.logisticsVerified.findIndex((user) => user._id === payload._id);
        if (logisticsIndexVerified !== -1) {
          state.logisticsVerified[logisticsIndexVerified].isActive = payload.isActive;
        }
      })
      .addCase(deleteUser.fulfilled, (state, { payload }) => {
        state.users = state.users.filter((user) => user._id !== payload);
        // Also decrement totalUsers and normalUsersCount if the deleted user matches
        if (state.totalUsers > 0) state.totalUsers -= 1;
        const deletedUser = state.users.find(user => user._id === payload);
        if (deletedUser && deletedUser.role === 'user' && state.normalUsersCount > 0) {
          state.normalUsersCount -= 1;
        }
      })

      // --- Dispute Actions ---
      .addCase(fetchAllDisputes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDisputes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.disputes = payload;
      })
      .addCase(fetchAllDisputes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(resolveDispute.pending, (state) => {
        state.loading = true;
      })
      .addCase(resolveDispute.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.disputes.findIndex(dispute => dispute._id === payload._id);
        if (index !== -1) {
          state.disputes[index] = payload;
        }
      })
      .addCase(resolveDispute.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default adminSlice.reducer;
