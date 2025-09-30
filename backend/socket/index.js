const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

let io; // keep a reference

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "https://roam-ease.vercel.app",
        "https://roam-ease.vercel.app",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173",
        "https://localhost:5173", // HTTPS localhost for Vite
      ],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"],
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6, // 1MB
  });

  io.onlineUsers = {}; // Track online users

  // Enhanced Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      console.log("🔍 Socket connection attempt:", {
        socketId: socket.id,
        origin: socket.handshake.headers.origin,
        userAgent: socket.handshake.headers["user-agent"],
        timestamp: new Date().toISOString(),
      });

      // Get token from auth object (preferred) or Authorization header
      const authToken = socket.handshake.auth?.token;
      const headerToken = socket.handshake.headers.authorization?.split(" ")[1];
      const token = authToken || headerToken;

      console.log("🔐 Token extraction:", {
        hasAuthToken: !!authToken,
        hasHeaderToken: !!headerToken,
        authTokenPreview: authToken
          ? authToken.substring(0, 20) + "..."
          : "none",
        headerTokenPreview: headerToken
          ? headerToken.substring(0, 20) + "..."
          : "none",
        finalTokenPreview: token ? token.substring(0, 20) + "..." : "none",
        authObject: socket.handshake.auth,
        headers: {
          authorization: socket.handshake.headers.authorization
            ? "present"
            : "missing",
          origin: socket.handshake.headers.origin,
        },
      });

      if (!token) {
        console.log("❌ Socket connection rejected: No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      // Validate JWT_SECRET is available
      if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET not found in environment variables");
        return next(
          new Error("Authentication error: Server configuration error")
        );
      }

      console.log("🔍 JWT_SECRET check:", {
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0,
        jwtSecretPreview: process.env.JWT_SECRET
          ? process.env.JWT_SECRET.substring(0, 10) + "..."
          : "none",
      });

      // Enhanced token validation with detailed logging
      try {
        console.log("🔍 Attempting JWT verification...");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("✅ Token decoded successfully:", {
          userId: decoded.id,
          exp: decoded.exp,
          iat: decoded.iat,
          currentTime: Math.floor(Date.now() / 1000),
          isExpired: decoded.exp < Math.floor(Date.now() / 1000),
          timeUntilExpiry: decoded.exp - Math.floor(Date.now() / 1000),
          tokenIssuedAt: new Date(decoded.iat * 1000).toISOString(),
          tokenExpiresAt: new Date(decoded.exp * 1000).toISOString(),
        });

        // Check if token is expired
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
          console.log("❌ Token is expired:", {
            exp: decoded.exp,
            now: Math.floor(Date.now() / 1000),
            expiredBy: Math.floor(Date.now() / 1000) - decoded.exp,
          });
          return next(new Error("Authentication error: Token expired"));
        }

        // Fetch user from database
        console.log("🔍 Fetching user from database...");
        const user = await User.findById(decoded.id).select("-password -__v");

        if (!user) {
          console.log(
            "❌ Socket connection rejected: User not found for ID:",
            decoded.id
          );
          return next(new Error("Authentication error: User not found"));
        }

        console.log("✅ User found:", {
          userId: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
        });

        // Attach user data to socket
        socket.userId = user._id.toString();
        socket.user = user;
        socket.userRole = user.role;

        console.log("✅ Socket authentication successful:", {
          socketId: socket.id,
          userId: user._id,
          email: user.email,
          role: user.role,
        });

        next();
      } catch (jwtError) {
        console.log("❌ JWT verification failed:", {
          error: jwtError.message,
          name: jwtError.name,
          tokenPreview: token.substring(0, 20) + "...",
          jwtSecretAvailable: !!process.env.JWT_SECRET,
          jwtSecretLength: process.env.JWT_SECRET?.length || 0,
        });

        // Provide more specific error messages
        let errorMessage = "Authentication error: Invalid token";
        if (jwtError.name === "TokenExpiredError") {
          errorMessage = "Authentication error: Token expired";
        } else if (jwtError.name === "JsonWebTokenError") {
          errorMessage = "Authentication error: Invalid token format";
        } else if (jwtError.name === "NotBeforeError") {
          errorMessage = "Authentication error: Token not active";
        }

        return next(new Error(errorMessage));
      }
    } catch (error) {
      console.log("❌ Socket connection rejected - General error:", {
        error: error.message,
        stack: error.stack,
      });
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ New authenticated connection:", {
      socketId: socket.id,
      userId: socket.userId,
      userEmail: socket.user?.email,
      userRole: socket.userRole,
      timestamp: new Date().toISOString(),
    });

    // User online
    socket.on("user-online", async (userId) => {
      try {
        // Use the authenticated user ID from socket instead of the parameter
        const authenticatedUserId = socket.userId;
        console.log("👤 User-online event received:", {
          sentUserId: userId,
          authenticatedUserId: authenticatedUserId,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });

        io.onlineUsers[authenticatedUserId] = socket.id;

        // Check if database is connected before attempting operations
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState === 1) {
          // Update user's online status in database with timeout handling
          const updatePromise = User.findByIdAndUpdate(
            authenticatedUserId,
            {
              isOnline: true,
              lastSeen: new Date(),
            },
            {
              new: true,
              timeout: 5000, // 5 second timeout
            }
          );

          // Use Promise.race to handle timeout
          await Promise.race([
            updatePromise,
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Database update timeout")),
                5000
              )
            ),
          ]);
          console.log(`✅ User ${authenticatedUserId} is now online`);
        } else {
          console.log(
            `⚠️ User ${authenticatedUserId} is now online (DB not connected, status cached)`
          );
        }

        // Join user to their specific room for notifications
        socket.join(`user-${authenticatedUserId}`);
        console.log(
          `✅ User ${authenticatedUserId} joined room: user-${authenticatedUserId}`
        );

        // Join admin room if user is admin
        if (socket.userRole === "admin") {
          socket.join("admin-room");
          console.log(`✅ Admin user ${authenticatedUserId} joined admin room`);
        }

        // Debug: List all rooms this socket is in
        console.log(
          `📋 Socket ${socket.id} is now in rooms:`,
          Array.from(socket.rooms)
        );

        // Emit to all other users that this user is online
        socket.broadcast.emit("user-online", authenticatedUserId);

        // Send current online users to the newly connected user
        const onlineUserIds = Object.keys(io.onlineUsers);
        socket.emit("online-users", onlineUserIds);
      } catch (error) {
        console.error("❌ Error updating user online status:", error.message);
        // Still emit the online status even if DB update fails
        socket.broadcast.emit("user-online", authenticatedUserId);
        const onlineUserIds = Object.keys(io.onlineUsers);
        socket.emit("online-users", onlineUserIds);
      }
    });

    // Get online users
    socket.on("get-online-users", () => {
      const onlineUserIds = Object.keys(io.onlineUsers);
      socket.emit("online-users", onlineUserIds);
    });

    // Broadcast message to other participants (message already created via API)
    socket.on("broadcast-message", async ({ message, conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        console.log(
          "📨 Broadcasting message to participants:",
          conversation.participants
        );
        console.log("📨 Message sender:", message.sender._id);
        console.log("📨 Current socket user:", socket.userId);

        // Broadcast to all other participants in the conversation (excluding sender)
        conversation.participants.forEach((participant) => {
          if (
            participant.toString() !== message.sender._id.toString() &&
            io.onlineUsers[participant]
          ) {
            console.log("📨 Sending message to participant:", participant);
            io.to(io.onlineUsers[participant]).emit("receive-message", {
              ...message,
              conversationId: conversationId,
            });
          } else {
            console.log(
              "📨 Skipping participant (sender or offline):",
              participant
            );
          }
        });
      } catch (err) {
        console.error("❌ Error handling broadcast-message:", err);
      }
    });

    // Join shipment tracking room
    socket.on("join-shipment-tracking", async (shipmentId) => {
      try {
        console.log(
          `🔍 User ${socket.userId} joining shipment tracking room: shipment:${shipmentId}`
        );

        // Verify user has permission to track this shipment
        const Shipment = require("../models/Shipment");
        const Bid = require("../models/Bid");

        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
          socket.emit("tracking-error", { message: "Shipment not found" });
          return;
        }

        // Check if user is owner, logistics handler, or admin
        const isOwner = shipment.user.toString() === socket.userId.toString();
        const acceptedBid = await Bid.findOne({
          shipment: shipmentId,
          carrier: socket.userId,
          status: "accepted",
        });
        const isLogisticsHandler = !!acceptedBid;
        const isAdmin = socket.userRole === "admin";

        if (!isOwner && !isLogisticsHandler && !isAdmin) {
          socket.emit("tracking-error", {
            message: "You do not have permission to track this shipment",
          });
          return;
        }

        // Join the shipment tracking room
        socket.join(`shipment:${shipmentId}`);
        console.log(
          `✅ User ${socket.userId} joined shipment tracking room: shipment:${shipmentId}`
        );

        // Send current tracking status
        socket.emit("tracking-status", {
          shipmentId,
          isTrackingActive: shipment.isTrackingActive,
          lastLocation: shipment.lastLocation,
          trackingStartedAt: shipment.trackingStartedAt,
        });
      } catch (error) {
        console.error("❌ Error joining shipment tracking room:", error);
        socket.emit("tracking-error", {
          message: "Error joining tracking room",
        });
      }
    });

    // Leave shipment tracking room
    socket.on("leave-shipment-tracking", (shipmentId) => {
      console.log(
        `🔍 User ${socket.userId} leaving shipment tracking room: shipment:${shipmentId}`
      );
      socket.leave(`shipment:${shipmentId}`);
    });

    socket.on("disconnect", async () => {
      console.log("🔌 User disconnected:", {
        socketId: socket.id,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });

      // Use the authenticated user ID from socket
      const authenticatedUserId = socket.userId;
      if (authenticatedUserId && io.onlineUsers[authenticatedUserId]) {
        try {
          // Check if database is connected before attempting operations
          const mongoose = require("mongoose");
          if (mongoose.connection.readyState === 1) {
            // Update user's offline status in database with timeout handling
            const updatePromise = User.findByIdAndUpdate(
              authenticatedUserId,
              {
                isOnline: false,
                lastSeen: new Date(),
              },
              {
                new: true,
                timeout: 5000, // 5 second timeout
              }
            );

            // Use Promise.race to handle timeout
            await Promise.race([
              updatePromise,
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Database update timeout")),
                  5000
                )
              ),
            ]);
            console.log(`✅ User ${authenticatedUserId} is now offline`);
          } else {
            console.log(
              `⚠️ User ${authenticatedUserId} is now offline (DB not connected, status cached)`
            );
          }

          // Emit to all other users that this user is offline
          socket.broadcast.emit("user-offline", authenticatedUserId);

          delete io.onlineUsers[authenticatedUserId];
        } catch (error) {
          console.error(
            "❌ Error updating user offline status:",
            error.message
          );
          // Still emit the offline status even if DB update fails
          socket.broadcast.emit("user-offline", authenticatedUserId);
          delete io.onlineUsers[authenticatedUserId];
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

module.exports = { initSocket, getIO };
