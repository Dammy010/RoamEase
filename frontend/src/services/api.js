// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://roamease-3wg1.onrender.com/api", // Render deployment URL
  withCredentials: true, // only if cookies are used
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handles 401 & refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401s once
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }
        // Call refresh endpoint
        const res = await axios.post(
          "https://roamease-3wg1.onrender.com/api/auth/refresh",
          {
            token: refreshToken, // matches backend contract
          }
        );
        const newAccessToken = res.data.accessToken;

        // Save new access token
        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        // Reconnect socket with new token
        try {
          const { reconnectSocket } = await import("./socket");
          const newSocket = reconnectSocket();
          if (newSocket) {
          }
        } catch (socketError) {
          console.warn("Socket reconnection failed:", socketError.message);
        }

        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error(
          "DEBUG: API Interceptor - Token refresh failed:",
          err.message
        );
        console.error(
          "DEBUG: API Interceptor - Error details:",
          err.response?.data
        );
        processQueue(err, null);

        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Dispatch logout action instead of direct redirect
        try {
          if (window.store && window.store.dispatch) {
            const { logout } = await import("../redux/slices/authSlice");
            window.store.dispatch(logout());
          } else {
            // Fallback to direct redirect if store is not available
            window.location.href = "/login";
          }
        } catch (dispatchError) {
          console.error(
            "DEBUG: API Interceptor - Failed to dispatch logout:",
            dispatchError.message
          );
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
