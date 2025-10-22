import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { toast } from "react-toastify";

// ---------------- Cache Management ----------------
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for shipments (shorter than profile)
const cache = {
  userShipments: {
    data: null,
    timestamp: null,
    isFetching: false,
  },
  deliveredShipments: {
    data: null,
    timestamp: null,
    isFetching: false,
  },
  availableShipments: {
    data: null,
    timestamp: null,
    isFetching: false,
  },
  shipmentById: {}, // Dynamic cache by ID
};

// Helper function to check if cache is valid
const isCacheValid = (cacheKey, id = null) => {
  const cached = id ? cache[cacheKey][id] : cache[cacheKey];
  if (!cached || !cached.data || !cached.timestamp) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
};

// Helper function to set cache
const setCache = (cacheKey, data, id = null) => {
  if (id) {
    if (!cache[cacheKey][id]) {
      cache[cacheKey][id] = {};
    }
    cache[cacheKey][id] = {
      data,
      timestamp: Date.now(),
      isFetching: false,
    };
  } else {
    cache[cacheKey] = {
      data,
      timestamp: Date.now(),
      isFetching: false,
    };
  }
};

// Helper function to clear cache
const clearShipmentCache = (cacheKey, id = null) => {
  if (id && cache[cacheKey] && cache[cacheKey][id]) {
    cache[cacheKey][id] = { data: null, timestamp: null, isFetching: false };
  } else if (cacheKey) {
    cache[cacheKey] = { data: null, timestamp: null, isFetching: false };
  } else {
    Object.keys(cache).forEach((key) => {
      if (key === "shipmentById") {
        cache[key] = {};
      } else {
        cache[key] = { data: null, timestamp: null, isFetching: false };
      }
    });
  }
};

// --- Async Thunks ---
// Post shipment
export const postShipment = createAsyncThunk(
  "shipment/post",
  async ({ data, contentType }, thunkAPI) => {
    try {
      const headers = {};
      if (contentType === "multipart/form-data") {
        // Don't set Content-Type for FormData, let browser set it with boundary
        // The browser will automatically set: multipart/form-data; boundary=----WebKitFormBoundary...
      } else {
        headers["Content-Type"] = "application/json";
      }

      const res = await api.post("/shipments", data, { headers });
      toast.success("Shipment posted successfully");

      // Clear user shipments cache since we added a new one
      clearShipmentCache("userShipments");

      return res.data; // { success, shipment }
    } catch (err) {
      console.error("❌ postShipment error:", err);
      const message = err.response?.data?.message || "Failed to post shipment";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch user shipments (active/open) - WITH CACHING
export const fetchUserShipments = createAsyncThunk(
  "shipment/fetchUser",
  async (_, thunkAPI) => {
    try {
      // Check if we already have valid cached data
      if (isCacheValid("userShipments")) {
        return cache.userShipments.data;
      }

      // Check if we're already fetching
      if (cache.userShipments.isFetching) {
        // Wait for the current fetch to complete
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!cache.userShipments.isFetching) {
              clearInterval(checkInterval);
              if (cache.userShipments.data) {
                resolve(cache.userShipments.data);
              } else {
                reject(new Error("User shipments fetch failed"));
              }
            }
          }, 100);
        });
      }

      // Mark as fetching
      cache.userShipments.isFetching = true;

      const res = await api.get("/shipments");

      // Handle 304 responses (cached data)
      const responseData = res.data || { success: true, shipments: [] };

      // Cache the result
      setCache("userShipments", responseData);

      return responseData; // { success, shipments }
    } catch (err) {
      // Reset fetching flag on error
      cache.userShipments.isFetching = false;

      const message =
        err.response?.data?.message || "Failed to fetch shipments";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Fetch shipment history
export const fetchShipmentHistory = createAsyncThunk(
  "shipment/fetchHistory",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/shipments/history");

      // Handle 304 responses (cached data)
      const responseData = res.data || { success: true, history: [] };

      return responseData; // { success, history }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch shipment history";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch shipment by ID - WITH CACHING
export const fetchShipmentById = createAsyncThunk(
  "shipment/fetchById",
  async (id, thunkAPI) => {
    try {
      // Check if we already have valid cached data for this specific shipment
      if (isCacheValid("shipmentById", id)) {
        return cache.shipmentById[id].data;
      }

      // Check if we're already fetching this specific shipment
      if (cache.shipmentById[id] && cache.shipmentById[id].isFetching) {
        // Wait for the current fetch to complete
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!cache.shipmentById[id] || !cache.shipmentById[id].isFetching) {
              clearInterval(checkInterval);
              if (cache.shipmentById[id] && cache.shipmentById[id].data) {
                resolve(cache.shipmentById[id].data);
              } else {
                reject(new Error(`Shipment ${id} fetch failed`));
              }
            }
          }, 100);
        });
      }

      // Initialize cache entry if it doesn't exist
      if (!cache.shipmentById[id]) {
        cache.shipmentById[id] = {};
      }

      // Mark as fetching
      cache.shipmentById[id].isFetching = true;

      const res = await api.get(`/shipments/${id}`);

      // Cache the result
      setCache("shipmentById", res.data, id);

      return res.data; // { success, shipment }
    } catch (err) {
      // Reset fetching flag on error
      if (cache.shipmentById[id]) {
        cache.shipmentById[id].isFetching = false;
      }

      const message = err.response?.data?.message || "Failed to fetch shipment";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateShipmentStatus = createAsyncThunk(
  "shipment/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const res = await api.put(`/shipments/${id}/status`, { status });
      toast.success("Shipment status updated successfully");

      // Clear relevant caches since status changed
      clearShipmentCache("userShipments");
      clearShipmentCache("shipmentById", id);
      clearShipmentCache("deliveredShipments");

      return res.data; // { success, shipment }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update shipment status";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// New: Fetch open shipments not created by the current user (for carriers to bid on) - WITH CACHING
export const fetchAvailableShipments = createAsyncThunk(
  "shipment/fetchAvailable",
  async (_, { rejectWithValue }) => {
    try {
      // Check if we already have valid cached data
      if (isCacheValid("availableShipments")) {
        return cache.availableShipments.data;
      }

      // Check if we're already fetching
      if (cache.availableShipments.isFetching) {
        // Wait for the current fetch to complete
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!cache.availableShipments.isFetching) {
              clearInterval(checkInterval);
              if (cache.availableShipments.data) {
                resolve(cache.availableShipments.data);
              } else {
                reject(new Error("Available shipments fetch failed"));
              }
            }
          }, 100);
        });
      }

      // Mark as fetching
      cache.availableShipments.isFetching = true;

      const response = await api.get("/shipments/available-for-bidding");

      // Cache the result
      setCache("availableShipments", response.data.shipments);

      return response.data.shipments;
    } catch (error) {
      // Reset fetching flag on error
      cache.availableShipments.isFetching = false;
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Public: Fetch open shipments (no authentication required)
export const fetchPublicOpenShipments = createAsyncThunk(
  "shipment/fetchPublicOpen",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/shipments/public/open-shipments");
      return response.data.shipments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// New: Fetch full shipment details by ID (for viewing complete information)
export const fetchShipmentDetailsById = createAsyncThunk(
  "shipment/fetchDetailsById",
  async (shipmentId, thunkAPI) => {
    try {
      const res = await api.get(`/shipments/${shipmentId}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      return res.data; // { success, shipment }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch shipment details";
      console.error(
        "ERROR: fetchShipmentDetailsById - API call failed:",
        message,
        err.response?.data
      );
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// New: Mark shipment as delivered by logistics company
export const markShipmentAsDeliveredByLogistics = createAsyncThunk(
  "shipment/markAsDeliveredByLogistics",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/shipments/${id}/mark-delivered-by-logistics`);

      // Clear relevant caches since status changed
      clearShipmentCache("userShipments");
      clearShipmentCache("shipmentById", id);
      clearShipmentCache("deliveredShipments");

      return res.data.shipment;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to mark shipment as delivered by logistics.";
      return rejectWithValue(message);
    }
  }
);

// New: Mark shipment as delivered by user
export const markShipmentAsDeliveredByUser = createAsyncThunk(
  "shipment/markAsDeliveredByUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/shipments/${id}/mark-delivered-by-user`);

      // Clear relevant caches since status changed
      clearShipmentCache("userShipments");
      clearShipmentCache("shipmentById", id);
      clearShipmentCache("deliveredShipments");

      return res.data.shipment;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to mark shipment as delivered.";
      return rejectWithValue(message);
    }
  }
);

// Rate a completed shipment
export const rateCompletedShipment = createAsyncThunk(
  "shipment/rateCompleted",
  async ({ id, rating, feedback }, { rejectWithValue }) => {
    try {
      // Validate rating on frontend
      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5 stars");
      }

      const res = await api.put(`/shipments/${id}/rate`, {
        rating: parseInt(rating),
        feedback: feedback || "",
      });

      toast.success(`Rating of ${rating} stars submitted successfully!`);

      // Clear relevant caches since rating changed
      clearShipmentCache("shipmentById", id);
      clearShipmentCache("deliveredShipments");

      return res.data.shipment;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit rating.";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete shipment
export const deleteShipment = createAsyncThunk(
  "shipment/delete",
  async (shipmentId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/shipments/${shipmentId}`);
      toast.success("Shipment deleted successfully");

      // Clear relevant caches since data has changed
      clearShipmentCache("userShipments");

      return shipmentId;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete shipment";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Fetch delivered shipments (completed shipments that can be rated) - WITH CACHING
export const fetchDeliveredShipments = createAsyncThunk(
  "shipment/fetchDelivered",
  async (_, { rejectWithValue }) => {
    try {
      // Check if we already have valid cached data
      if (isCacheValid("deliveredShipments")) {
        return cache.deliveredShipments.data;
      }

      // Check if we're already fetching
      if (cache.deliveredShipments.isFetching) {
        // Wait for the current fetch to complete
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!cache.deliveredShipments.isFetching) {
              clearInterval(checkInterval);
              if (cache.deliveredShipments.data) {
                resolve(cache.deliveredShipments.data);
              } else {
                reject(new Error("Delivered shipments fetch failed"));
              }
            }
          }, 100);
        });
      }

      // Mark as fetching
      cache.deliveredShipments.isFetching = true;

      const res = await api.get("/shipments/delivered");

      // Cache the result
      setCache("deliveredShipments", res.data.shipments || []);

      return res.data.shipments || [];
    } catch (err) {
      // Reset fetching flag on error
      cache.deliveredShipments.isFetching = false;

      const message =
        err.response?.data?.message || "Failed to fetch delivered shipments";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// --- Slice ---
const shipmentSlice = createSlice({
  name: "shipment",
  initialState: {
    shipments: [],
    history: [],
    availableShipments: [],
    deliveredShipments: [],
    deliveredShipmentsCount: 0,
    currentShipment: null,
    loading: false,
    error: null,
    // Add cache status for debugging
    cacheStatus: {
      userShipments: {
        isValid: isCacheValid("userShipments"),
        lastFetched: cache.userShipments.timestamp,
      },
      deliveredShipments: {
        isValid: isCacheValid("deliveredShipments"),
        lastFetched: cache.deliveredShipments.timestamp,
      },
      availableShipments: {
        isValid: isCacheValid("availableShipments"),
        lastFetched: cache.availableShipments.timestamp,
      },
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentShipment: (state) => {
      state.currentShipment = null;
    },
    clearDeliveredShipmentsCount: (state) => {
      // Clear any delivered shipments notification count
      // This could be used to mark delivered shipments as "viewed"
      // For now, we'll just reset any count-related state
      state.deliveredShipmentsCount = 0;
    },
    addShipmentRealtime: (state, action) => {
      // Add a new shipment to the state (received via socket)
      const shipment = action.payload;
      const existingIndex = state.shipments.findIndex(
        (s) => s._id === shipment._id
      );
      if (existingIndex === -1) {
        state.shipments.unshift(shipment); // Add to beginning
      }
    },
    updateShipmentRealtime: (state, action) => {
      // Update an existing shipment in the state (received via socket)
      const updatedShipment = action.payload;
      const index = state.shipments.findIndex(
        (s) => s._id === updatedShipment._id
      );
      if (index !== -1) {
        state.shipments[index] = updatedShipment;
      }
    },
    // Add action to manually clear cache (for debugging)
    clearCache: (state) => {
      clearShipmentCache();
      state.cacheStatus = {
        userShipments: {
          isValid: false,
          lastFetched: null,
        },
        deliveredShipments: {
          isValid: false,
          lastFetched: null,
        },
        availableShipments: {
          isValid: false,
          lastFetched: null,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Post shipment
      .addCase(postShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postShipment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.shipments.push(payload.shipment);
        state.error = null;
        // Update cache status
        state.cacheStatus.userShipments.isValid = isCacheValid("userShipments");
        state.cacheStatus.userShipments.lastFetched =
          cache.userShipments.timestamp;
      })
      .addCase(postShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user shipments
      .addCase(fetchUserShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.shipments = payload.shipments || [];
        state.error = null;
        // Update cache status
        state.cacheStatus.userShipments.isValid = isCacheValid("userShipments");
        state.cacheStatus.userShipments.lastFetched =
          cache.userShipments.timestamp;
      })
      .addCase(fetchUserShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Update cache status
        state.cacheStatus.userShipments.isValid = false;
        state.cacheStatus.userShipments.lastFetched = null;
      })

      // Fetch shipment history
      .addCase(fetchShipmentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.history = payload.history || [];
        state.error = null;
      })
      .addCase(fetchShipmentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch shipment by ID
      .addCase(fetchShipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentShipment = payload.shipment;
        state.error = null;
      })
      .addCase(fetchShipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update shipment status
      .addCase(updateShipmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipmentStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.shipments.findIndex(
          (s) => s._id === payload.shipment._id
        );
        if (index !== -1) {
          state.shipments[index] = payload.shipment;
        }
        if (
          state.currentShipment &&
          state.currentShipment._id === payload.shipment._id
        ) {
          state.currentShipment = payload.shipment;
        }
        state.error = null;
        // Update cache status
        state.cacheStatus.userShipments.isValid = isCacheValid("userShipments");
        state.cacheStatus.userShipments.lastFetched =
          cache.userShipments.timestamp;
      })
      .addCase(updateShipmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch available shipments
      .addCase(fetchAvailableShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.availableShipments = payload;
        state.error = null;
        // Update cache status
        state.cacheStatus.availableShipments.isValid =
          isCacheValid("availableShipments");
        state.cacheStatus.availableShipments.lastFetched =
          cache.availableShipments.timestamp;
      })
      .addCase(fetchAvailableShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Update cache status
        state.cacheStatus.availableShipments.isValid = false;
        state.cacheStatus.availableShipments.lastFetched = null;
      })

      // Fetch public open shipments
      .addCase(fetchPublicOpenShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicOpenShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.availableShipments = payload;
        state.error = null;
      })
      .addCase(fetchPublicOpenShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch shipment details by ID
      .addCase(fetchShipmentDetailsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipmentDetailsById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentShipment = payload.shipment;
        state.error = null;
      })
      .addCase(fetchShipmentDetailsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark shipment as delivered by logistics
      .addCase(markShipmentAsDeliveredByLogistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        markShipmentAsDeliveredByLogistics.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          const index = state.shipments.findIndex((s) => s._id === payload._id);
          if (index !== -1) {
            state.shipments[index] = payload;
          }
          if (
            state.currentShipment &&
            state.currentShipment._id === payload._id
          ) {
            state.currentShipment = payload;
          }
          state.error = null;
          // Update cache status
          state.cacheStatus.userShipments.isValid =
            isCacheValid("userShipments");
          state.cacheStatus.userShipments.lastFetched =
            cache.userShipments.timestamp;
          state.cacheStatus.deliveredShipments.isValid =
            isCacheValid("deliveredShipments");
          state.cacheStatus.deliveredShipments.lastFetched =
            cache.deliveredShipments.timestamp;
        }
      )
      .addCase(markShipmentAsDeliveredByLogistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark shipment as delivered by user
      .addCase(markShipmentAsDeliveredByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        markShipmentAsDeliveredByUser.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          const index = state.shipments.findIndex((s) => s._id === payload._id);
          if (index !== -1) {
            state.shipments[index] = payload;
          }
          if (
            state.currentShipment &&
            state.currentShipment._id === payload._id
          ) {
            state.currentShipment = payload;
          }
          state.error = null;
          // Update cache status
          state.cacheStatus.userShipments.isValid =
            isCacheValid("userShipments");
          state.cacheStatus.userShipments.lastFetched =
            cache.userShipments.timestamp;
          state.cacheStatus.deliveredShipments.isValid =
            isCacheValid("deliveredShipments");
          state.cacheStatus.deliveredShipments.lastFetched =
            cache.deliveredShipments.timestamp;
        }
      )
      .addCase(markShipmentAsDeliveredByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Rate completed shipment
      .addCase(rateCompletedShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rateCompletedShipment.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.deliveredShipments.findIndex(
          (s) => s._id === payload._id
        );
        if (index !== -1) {
          state.deliveredShipments[index] = payload;
        }
        if (
          state.currentShipment &&
          state.currentShipment._id === payload._id
        ) {
          state.currentShipment = payload;
        }
        state.error = null;
        // Update cache status
        state.cacheStatus.deliveredShipments.isValid =
          isCacheValid("deliveredShipments");
        state.cacheStatus.deliveredShipments.lastFetched =
          cache.deliveredShipments.timestamp;
      })
      .addCase(rateCompletedShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch delivered shipments
      .addCase(fetchDeliveredShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveredShipments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.deliveredShipments = payload;
        state.error = null;
        // Update cache status
        state.cacheStatus.deliveredShipments.isValid =
          isCacheValid("deliveredShipments");
        state.cacheStatus.deliveredShipments.lastFetched =
          cache.deliveredShipments.timestamp;
      })
      .addCase(fetchDeliveredShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Update cache status
        state.cacheStatus.deliveredShipments.isValid = false;
        state.cacheStatus.deliveredShipments.lastFetched = null;
      })

      // Delete shipment
      .addCase(deleteShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShipment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.shipments = state.shipments.filter((s) => s._id !== payload);
        state.error = null;
        // Update cache status
        state.cacheStatus.userShipments.isValid = isCacheValid("userShipments");
        state.cacheStatus.userShipments.lastFetched =
          cache.userShipments.timestamp;
      })
      .addCase(deleteShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentShipment,
  clearDeliveredShipmentsCount,
  addShipmentRealtime,
  updateShipmentRealtime,
  clearCache,
} = shipmentSlice.actions;
export default shipmentSlice.reducer;
