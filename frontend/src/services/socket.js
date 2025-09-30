import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (socket) {
    return socket;
  }

  const token = localStorage.getItem("token");

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

  socket = io(socketURL, {
    transports: ["websocket", "polling"], // Try websocket first, fallback to polling
    autoConnect: true,
    withCredentials: true,
    timeout: 20000,
    forceNew: true,
    auth: {
      token: token,
    },
    // Socket.IO v4 specific options
    upgrade: true,
    rememberUpgrade: true,
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
    });

    // Send user-online event to join the user to their specific room
    const userStr = localStorage.getItem("user");
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
    });
    console.error("🔍 Socket URL:", socketURL);
    console.error("🔍 Token present:", !!localStorage.getItem("token"));
    console.error(
      "🔍 Token value:",
      localStorage.getItem("token")?.substring(0, 20) + "..."
    );

    if (error.message.includes("Authentication error")) {
      console.error("🔐 Authentication error - token might be invalid");
      // Try to refresh the token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        console.log("🔄 Attempting to refresh token...");
        // The API interceptor will handle token refresh
      }
    }
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      // Server disconnected the client, reconnect manually
      setTimeout(() => {
        socket.connect();
      }, 1000);
    }
  });

  // Handle reconnection events
  socket.on("reconnect", (attemptNumber) => {});

  socket.on("reconnect_attempt", (attemptNumber) => {});

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
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }
    const newSocket = initSocket();
    return newSocket;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = () => {
  disconnectSocket();
  const token = localStorage.getItem("token");
  if (token) {
    return initSocket();
  } else {
    return null;
  }
};

// Initialize socket only after successful login
export const initializeSocketAfterLogin = () => {
  const token = localStorage.getItem("token");
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

  const token = localStorage.getItem("token");
  if (token) {
    return initSocket();
  }
  return null;
};
