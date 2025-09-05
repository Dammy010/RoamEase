import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../services/api";

// ---------------- Hydrate from localStorage ----------------
const accessToken = localStorage.getItem("token");
console.log("DEBUG: authSlice - Initial accessToken from localStorage:", accessToken ? "Present" : "Not present");
let user = null;

try {
  const storedUser = localStorage.getItem("user");
  console.log("DEBUG: authSlice - Raw storedUser from localStorage:", storedUser);
  if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
    user = JSON.parse(storedUser);
    console.log("DEBUG: authSlice - Parsed user object:", user);
    // Ensure all required fields are present for logistics users
    if (user && user.role === "logistics") {
      user = {
        ...user,
        companyName: user.companyName || "",
        contactName: user.contactName || "",
        country: user.country || "",
        verificationStatus: user.verificationStatus || "pending",
        isVerified: user.isVerified || false
      };
      console.log("DEBUG: authSlice - Adjusted logistics user object:", user);
    }
  }
} catch (err) {
  console.warn("Failed to parse stored user:", err);
  user = null;
}

// ---------------- Thunks ----------------

// Login
export const loginUser = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await api.post("/auth/login", data);
    const { _id, name, email, role, phoneNumber, profilePicture, ...restUser } = res.data; // Capture other user fields
    
    // Construct userData with all relevant fields
    const userData = { _id, name, email, role, phoneNumber, profilePicture, ...restUser };

    // Debug logging for logistics users
    if (role === "logistics") {
      console.log("Frontend login - companyName:", userData.companyName);
      console.log("Frontend login - contactName:", userData.contactName);
      console.log("Frontend login - full userData:", userData);
    }

    localStorage.setItem("token", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    toast.success("Login successful");
    return userData;
  } catch (err) {
    const message = err.response?.data?.message || "Login failed";
    toast.error(message);
    return thunkAPI.rejectWithValue({ message });
  }
});

// Signup
export const signupUser = createAsyncThunk("auth/signup", async (data, thunkAPI) => {
  try {
    const headers = data instanceof FormData ? {} : { "Content-Type": "application/json" };
    const res = await api.post("/auth/register", data, { headers });

    const { _id, name, email, role, phoneNumber, profilePicture, ...restUser } = res.data; // Capture other user fields
    const userData = { _id, name, email, role, phoneNumber, profilePicture, ...restUser };

    localStorage.setItem("token", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    toast.success("Signup successful");
    return userData;
  } catch (err) {
    const message = err.response?.data?.message || "Signup failed";
    toast.error(message);
    return thunkAPI.rejectWithValue({ message });
  }
});

// Verify Email
export const verifyEmail = createAsyncThunk("auth/verifyEmail", async (token, thunkAPI) => {
  try {
    const res = await api.post(`/auth/verify-email/${token}`);
    toast.success("Email verified. You may now log in.");
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || "Verification failed";
    toast.error(message);
    return thunkAPI.rejectWithValue({ message });
  }
});

// Fetch Profile
export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, thunkAPI) => {
  try {
    const res = await api.get("/auth/profile");
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to load profile";
    toast.error(message);
    return thunkAPI.rejectWithValue({ message });
  }
});

// Update Profile
export const updateProfile = createAsyncThunk("auth/updateProfile", async (formData, thunkAPI) => {
  try {
    const headers = formData instanceof FormData ? {} : { "Content-Type": "application/json" };
    const res = await api.put("/auth/profile", formData, { headers });

    const { _id, name, email, role, phoneNumber, profilePicture, ...restUser } = res.data; // Capture all fields
    const userData = { _id, name, email, role, phoneNumber, profilePicture, ...restUser };

    localStorage.setItem("token", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    toast.success("Profile updated successfully");
    return userData;
  } catch (err) {
    const message = err.response?.data?.message || "Update failed";
    toast.error(message);
    return thunkAPI.rejectWithValue({ message });
  }
});

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
      console.log("DEBUG: authSlice - Logout action dispatched");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
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
        console.log("DEBUG: loginUser.fulfilled - Payload received:", payload);
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
        console.log("DEBUG: signupUser.fulfilled - Payload received:", payload);
        state.loading = false;
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
      });
  },
});

// ---------------- Exports ----------------
export const { logout } = authSlice.actions;
export default authSlice.reducer;
