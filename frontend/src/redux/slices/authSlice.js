import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../services/api";

// ---------------- Hydrate from localStorage ----------------
const accessToken = localStorage.getItem("token");
let user = null;

try {
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
    user = JSON.parse(storedUser);
    // Ensure all required fields are present for logistics users
    if (user && user.role === "logistics") {
      user = {
        ...user,
        companyName: user.companyName || "",
        contactName: user.contactName || "",
        country: user.country || "",
        verificationStatus: user.verificationStatus || "pending",
        isVerified: user.isVerified || false,
      };
    }
  }
} catch (err) {
  console.warn("Failed to parse stored user:", err);
  user = null;
}

// ---------------- Thunks ----------------

// Login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", data);

      // Check if email verification is required
      if (res.data.isVerified === false) {
        const message =
          res.data.message ||
          "Please verify your email address before logging in.";
        toast.error(message);
        return thunkAPI.rejectWithValue({
          message,
          needsVerification: true,
          email: res.data.email,
          code: "EMAIL_VERIFICATION_REQUIRED",
        });
      }

      const {
        _id,
        name,
        email,
        role,
        phoneNumber,
        profilePicture,
        ...restUser
      } = res.data; // Capture other user fields

      // Construct userData with all relevant fields
      const userData = {
        _id,
        name,
        email,
        role,
        phoneNumber,
        profilePicture,
        ...restUser,
      };

      if (role === "logistics") {
      }

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Login successful");
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      const needsVerification = err.response?.data?.isVerified === false;
      const email = err.response?.data?.email;

      if (needsVerification) {
        toast.error(message);
        return thunkAPI.rejectWithValue({
          message,
          needsVerification: true,
          email,
          code: "EMAIL_VERIFICATION_REQUIRED",
        });
      }

      toast.error(message);
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Signup
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (data, thunkAPI) => {
    try {
      const headers =
        data instanceof FormData ? {} : { "Content-Type": "application/json" };
      const res = await api.post("/auth/register", data, { headers });

      // Check if email verification is required
      if (
        res.data.needsVerification ||
        (res.data.message && res.data.message.includes("verify your account"))
      ) {
        const message = res.data.message;
        toast.success(message);
        return thunkAPI.rejectWithValue({
          message,
          needsVerification: true,
          email: res.data.email,
          code: "EMAIL_VERIFICATION_REQUIRED",
        });
      }

      const {
        _id,
        name,
        email,
        role,
        phoneNumber,
        profilePicture,
        ...restUser
      } = res.data; // Capture other user fields
      const userData = {
        _id,
        name,
        email,
        role,
        phoneNumber,
        profilePicture,
        ...restUser,
      };

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Signup successful");
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      const needsVerification = err.response?.data?.message?.includes(
        "verify your account"
      );
      const email = err.response?.data?.email;

      if (needsVerification) {
        toast.success(message); // Show as success since verification email was sent
        return thunkAPI.rejectWithValue({
          message,
          needsVerification: true,
          email,
          code: "EMAIL_VERIFICATION_REQUIRED",
        });
      }

      toast.error(message);
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Verify Email
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (code, thunkAPI) => {
    try {
      const res = await api.post(`/auth/verify`, { code });
      toast.success("Email verified successfully! You can now log in.");
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Verification failed";
      toast.error(message);
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Resend Verification Email
export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerificationEmail",
  async (email, thunkAPI) => {
    try {
      const res = await api.post("/auth/resend-verification", { email });
      toast.success("Verification email sent! Please check your inbox.");
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to resend verification email";
      toast.error(message);
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Check Verification Status
export const checkVerificationStatus = createAsyncThunk(
  "auth/checkVerificationStatus",
  async (email, thunkAPI) => {
    try {
      const res = await api.get(
        `/auth/verification-status?email=${encodeURIComponent(email)}`
      );
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to check verification status";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Fetch Profile
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/profile");
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load profile";
      console.error("❌ fetchProfile: Error:", err);
      toast.error(message);
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, thunkAPI) => {
    try {
      const headers =
        formData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" };
      const res = await api.put("/auth/profile", formData, { headers });

      // Get current user data from state
      const currentState = thunkAPI.getState();
      const currentUser = currentState.auth.user;

      // Merge only the updated fields with current user data
      const updatedUser = { ...currentUser, ...res.data };

      // Update localStorage efficiently
      if (res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
      }
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// ---------------- Slice ----------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user,
    role: user?.role || null,
    isAuthenticated: !!accessToken && !!user,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfilePicture: (state, action) => {
      if (state.user) {
        // Handle both old format (string) and new format (object with profilePictureUrl and profilePictureId)
        if (typeof action.payload === "string") {
          // Old format - just the URL
          state.user.profilePicture = action.payload;
        } else if (action.payload && action.payload.profilePictureUrl) {
          // New format - object with profilePictureUrl and profilePictureId
          state.user.profilePictureUrl = action.payload.profilePictureUrl;
          state.user.profilePictureId = action.payload.profilePictureId;
          // Keep old field for backward compatibility
          state.user.profilePicture = action.payload.profilePictureUrl;
        }
        // Update localStorage as well
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.role = payload.role;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.user = payload;
        state.role = payload.role;
        state.isAuthenticated = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Signup failed";
      })

      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Verification failed";
      })

      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.role = payload.role;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch profile";
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.role = payload.role;
        state.isAuthenticated = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Update failed";
      })

      // Resend Verification Email
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to resend verification email";
      })

      // Check Verification Status
      .addCase(checkVerificationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVerificationStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkVerificationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to check verification status";
      });
  },
});

// ---------------- Exports ----------------
export const { logout, clearError, updateProfilePicture } = authSlice.actions;
export default authSlice.reducer;
