import { io } from "socket.io-client";

let socket;

// Mobile detection
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// Safe localStorage wrapper for mobile
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item ${key}:`, error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage item ${key}:`, error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage item ${key}:`, error);
    }
  },
};

export const initSocket = () => {
  if (socket) {
    return socket;
  }

  const token = safeLocalStorage.getItem("token");

  // Only initialize socket if we have a valid token
  if (!token) {
    console.log("⚠️ No token found, skipping socket initialization");
    return null;
  }

  // Auto-detect environment and use appropriate socket URL
  const getSocketURL = () => {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:5000"; // Local development
    } else {
      return "https://roamease-3wg1.onrender.com"; // Production
    }
  };

  const socketURL = getSocketURL();
  console.log("🔌 Initializing Socket.IO connection to:", socketURL);
  console.log("🔐 Token details:", {
    hasToken: !!token,
    tokenLength: token.length,
    tokenPreview: token.substring(0, 20) + "...",
    tokenEnd: "..." + token.substring(token.length - 10),
  });

  socket = io(socketURL, {
    transports: isMobile ? ["polling", "websocket"] : ["websocket", "polling"], // Mobile prefers polling first
    autoConnect: true,
    withCredentials: true,
    timeout: isMobile ? 30000 : 20000, // Longer timeout for mobile
    forceNew: true,
    auth: {
      token: token, // ✅ Pass token in auth object
    },
    // Socket.IO v4 specific options
    upgrade: true,
    rememberUpgrade: true,
    // Mobile-specific optimizations
    reconnection: true,
    reconnectionDelay: isMobile ? 2000 : 1000, // Slower reconnection for mobile
    reconnectionAttempts: isMobile ? 3 : 5, // Fewer attempts on mobile
    maxReconnectionAttempts: isMobile ? 3 : 5,
    // Mobile-optimized polling
    polling: {
      extraHeaders: {
        "Cache-Control": "no-cache",
      },
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected successfully!");
    console.log("🔍 Connection details:", {
      socketId: socket.id,
      transport: socket.io.engine.transport.name,
      url: socketURL,
      authToken: socket.auth?.token
        ? socket.auth.token.substring(0, 20) + "..."
        : "none",
      connected: socket.connected,
      authObject: socket.auth, // Log the entire auth object
    });

    // Send user-online event to join the user to their specific room
    const userStr = safeLocalStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user._id;
        if (userId) {
          socket.emit("user-online", userId);
          console.log("👤 User-online event sent for user:", userId);
        } else {
          console.warn("⚠️ No user ID found in localStorage");
        }
      } catch (error) {
        console.error("❌ Error parsing user from localStorage:", error);
      }
    } else {
      console.warn("⚠️ No user data found in localStorage");
    }
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket.io connection error:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      description: error.description,
      context: error.context,
      type: error.type,
      data: error.data,
    });
    console.error("🔍 Socket URL:", socketURL);
    console.error("🔍 Token present:", !!safeLocalStorage.getItem("token"));
    console.error(
      "🔍 Token value:",
      safeLocalStorage.getItem("token")?.substring(0, 20) + "..."
    );
    console.error("🔍 Auth object:", socket.auth);

    if (error.message.includes("Authentication error")) {
      console.error("🔐 Authentication error - token might be invalid");
      console.error("🔍 Checking token validity...");

      // Try to decode the token to see if it's valid
      try {
        const token = safeLocalStorage.getItem("token");
        if (token) {
          // Split the token to see its structure
          const parts = token.split(".");
          console.log("🔍 Token structure:", {
            parts: parts.length,
            header: parts[0] ? atob(parts[0]) : "invalid",
            payload: parts[1] ? JSON.parse(atob(parts[1])) : "invalid",
            signature: parts[2] ? "present" : "missing",
          });

          // Check if token is expired
          if (parts[1]) {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < now;
            console.log("🔍 Token expiration check:", {
              exp: payload.exp,
              now: now,
              isExpired: isExpired,
              timeUntilExpiry: payload.exp - now,
            });
          }
        }
      } catch (tokenError) {
        console.error("❌ Token parsing error:", tokenError);
      }

      // Try to refresh the token
      const refreshToken = safeLocalStorage.getItem("refreshToken");
      if (refreshToken) {
        console.log("🔄 Attempting to refresh token...");
        // The API interceptor will handle token refresh
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
    if (reason === "io server disconnect") {
      // Server disconnected the client, reconnect manually
      setTimeout(() => {
        console.log("🔄 Attempting to reconnect...");
        socket.connect();
      }, 1000);
    }
  });

  // Handle reconnection events
  socket.on("reconnect", (attemptNumber) => {
    console.log("✅ Socket reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("🔄 Socket reconnection attempt:", attemptNumber);
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ Socket.io reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Socket.io reconnection failed");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const token = safeLocalStorage.getItem("token");
    if (!token) {
      console.log("⚠️ No token available for socket connection");
      return null;
    }
    const newSocket = initSocket();
    return newSocket;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = () => {
  console.log("🔄 Reconnecting socket...");
  disconnectSocket();
  const token = safeLocalStorage.getItem("token");
  if (token) {
    return initSocket();
  } else {
    console.log("⚠️ No token available for socket reconnection");
    return null;
  }
};

// Initialize socket only after successful login
export const initializeSocketAfterLogin = () => {
  const token = safeLocalStorage.getItem("token");
  console.log("🔐 Initializing socket after login:", {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + "..." : "none",
  });

  if (token && !socket) {
    return initSocket();
  }
  return socket;
};

// Reconnect socket after token refresh
export const reconnectSocketAfterTokenRefresh = () => {
  if (socket) {
    console.log("🔄 Reconnecting socket after token refresh...");
    socket.disconnect();
    socket = null;
  }

  const token = safeLocalStorage.getItem("token");
  console.log("🔐 Token after refresh:", {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + "..." : "none",
  });

  if (token) {
    return initSocket();
  }
  return null;
};

// Debug function to check token validity
export const debugToken = () => {
  const token = safeLocalStorage.getItem("token");
  if (!token) {
    console.log("❌ No token found in localStorage");
    return;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("❌ Invalid token format - should have 3 parts");
      return;
    }

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;

    console.log("🔍 Token Debug Info:", {
      header,
      payload,
      isExpired,
      exp: payload.exp,
      now: now,
      timeUntilExpiry: payload.exp - now,
      tokenPreview: token.substring(0, 20) + "...",
    });

    return {
      isValid: !isExpired,
      isExpired,
      payload,
    };
  } catch (error) {
    console.error("❌ Error parsing token:", error);
    return null;
  }
};
