import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for report management
export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports/create', reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getUserReports = createAsyncThunk(
  'reports/getUserReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/reports/my-reports?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAllReports = createAsyncThunk(
  'reports/getAllReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/reports/admin/all?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReport = createAsyncThunk(
  'reports/getReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ reportId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/admin/${reportId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'reports/addComment',
  async ({ reportId, message, isInternal = false }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reports/${reportId}/comment`, {
        message,
        isInternal
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReportStats = createAsyncThunk(
  'reports/getReportStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reports/admin/${reportId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    // User reports
    userReports: [],
    userReportsLoading: false,
    userReportsError: null,
    userReportsPagination: {
      current: 1,
      pages: 1,
      total: 0
    },
    
    // Admin reports
    allReports: [],
    allReportsLoading: false,
    allReportsError: null,
    allReportsPagination: {
      current: 1,
      pages: 1,
      total: 0
    },
    
    // Single report
    currentReport: null,
    currentReportLoading: false,
    currentReportError: null,
    
    // Report statistics
    stats: null,
    statsLoading: false,
    statsError: null,
    
    // General state
    createLoading: false,
    createError: null,
    updateLoading: false,
    updateError: null,
    deleteLoading: false,
    deleteError: null
  },
  reducers: {
    clearReportError: (state, action) => {
      const errorType = action.payload || 'general';
      switch (errorType) {
        case 'create':
          state.createError = null;
          break;
        case 'update':
          state.updateError = null;
          break;
        case 'userReports':
          state.userReportsError = null;
          break;
        case 'allReports':
          state.allReportsError = null;
          break;
        case 'currentReport':
          state.currentReportError = null;
          break;
        case 'stats':
          state.statsError = null;
          break;
        default:
          state.createError = null;
          state.updateError = null;
          state.userReportsError = null;
          state.allReportsError = null;
          state.currentReportError = null;
          state.statsError = null;
      }
    },
    
    clearCurrentReport: (state) => {
      state.currentReport = null;
      state.currentReportError = null;
    },
    
    setUserReportsFilters: (state, action) => {
      state.userReportsFilters = action.payload;
    },
    
    setAllReportsFilters: (state, action) => {
      state.allReportsFilters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.createLoading = false;
        state.userReports.unshift(action.payload.data);
        state.createError = null;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Get User Reports
      .addCase(getUserReports.pending, (state) => {
        state.userReportsLoading = true;
        state.userReportsError = null;
      })
      .addCase(getUserReports.fulfilled, (state, action) => {
        state.userReportsLoading = false;
        state.userReports = action.payload.data;
        state.userReportsPagination = action.payload.pagination;
        state.userReportsError = null;
      })
      .addCase(getUserReports.rejected, (state, action) => {
        state.userReportsLoading = false;
        state.userReportsError = action.payload;
      })
      
      // Get All Reports (Admin)
      .addCase(getAllReports.pending, (state) => {
        state.allReportsLoading = true;
        state.allReportsError = null;
      })
      .addCase(getAllReports.fulfilled, (state, action) => {
        state.allReportsLoading = false;
        state.allReports = action.payload.data;
        state.allReportsPagination = action.payload.pagination;
        state.allReportsError = null;
      })
      .addCase(getAllReports.rejected, (state, action) => {
        state.allReportsLoading = false;
        state.allReportsError = action.payload;
      })
      
      // Get Single Report
      .addCase(getReport.pending, (state) => {
        state.currentReportLoading = true;
        state.currentReportError = null;
      })
      .addCase(getReport.fulfilled, (state, action) => {
        state.currentReportLoading = false;
        state.currentReport = action.payload.data;
        state.currentReportError = null;
      })
      .addCase(getReport.rejected, (state, action) => {
        state.currentReportLoading = false;
        state.currentReportError = action.payload;
      })
      
      // Update Report
      .addCase(updateReport.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update in all reports list
        const index = state.allReports.findIndex(
          report => report._id === action.payload.data._id
        );
        if (index !== -1) {
          state.allReports[index] = action.payload.data;
        }
        // Update in user reports list
        const userIndex = state.userReports.findIndex(
          report => report._id === action.payload.data._id
        );
        if (userIndex !== -1) {
          state.userReports[userIndex] = action.payload.data;
        }
        // Update current report
        if (state.currentReport && state.currentReport._id === action.payload.data._id) {
          state.currentReport = action.payload.data;
        }
        state.updateError = null;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentReport) {
          state.currentReport.comments = action.payload.data;
        }
      })
      
      // Get Report Stats
      .addCase(getReportStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getReportStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
        state.statsError = null;
      })
      .addCase(getReportStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Delete Report
      .addCase(deleteReport.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.deleteLoading = false;
        // Remove from all reports list
        state.allReports = state.allReports.filter(
          report => report._id !== action.meta.arg
        );
        // Remove from user reports list
        state.userReports = state.userReports.filter(
          report => report._id !== action.meta.arg
        );
        // Clear current report if it was deleted
        if (state.currentReport && state.currentReport._id === action.meta.arg) {
          state.currentReport = null;
        }
        state.deleteError = null;
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  }
});

export const {
  clearReportError,
  clearCurrentReport,
  setUserReportsFilters,
  setAllReportsFilters
} = reportSlice.actions;

export default reportSlice.reducer;
