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
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5000"
      ], 
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  io.onlineUsers = {}; // Track online users

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        console.log("Socket connection rejected: No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password -__v");
      
      if (!user) {
        console.log("Socket connection rejected: User not found");
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      socket.userRole = user.role;
      next();
    } catch (error) {
      console.log("Socket connection rejected:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New authenticated connection:", socket.id, "User:", socket.userId);

    // User online
    socket.on("user-online", async (userId) => {
      try {
        // Use the authenticated user ID from socket instead of the parameter
        const authenticatedUserId = socket.userId;
        console.log("👤 User-online event received:", { 
          sentUserId: userId, 
          authenticatedUserId: authenticatedUserId,
          socketId: socket.id 
        });
        io.onlineUsers[authenticatedUserId] = socket.id;
        
        // Check if database is connected before attempting operations
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
          // Update user's online status in database with timeout handling
          const updatePromise = User.findByIdAndUpdate(authenticatedUserId, {
            isOnline: true,
            lastSeen: new Date()
          }, { 
            new: true,
            timeout: 5000 // 5 second timeout
          });

          // Use Promise.race to handle timeout
          await Promise.race([
            updatePromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database update timeout')), 5000)
            )
          ]);
          console.log(`User ${authenticatedUserId} is now online`);
        } else {
          console.log(`User ${authenticatedUserId} is now online (DB not connected, status cached)`);
        }

        // Join user to their specific room for notifications
        socket.join(`user-${authenticatedUserId}`);
        console.log(`✅ User ${authenticatedUserId} joined room: user-${authenticatedUserId}`);
        
        // Join admin room if user is admin
        if (socket.userRole === 'admin') {
          socket.join('admin-room');
          console.log(`✅ Admin user ${authenticatedUserId} joined admin room`);
        }
        
        // Debug: List all rooms this socket is in
        console.log(`📋 Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));

        // Emit to all other users that this user is online
        socket.broadcast.emit("user-online", authenticatedUserId);
        
        // Send current online users to the newly connected user
        const onlineUserIds = Object.keys(io.onlineUsers);
        socket.emit("online-users", onlineUserIds);
        
      } catch (error) {
        console.error("Error updating user online status:", error.message);
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

        console.log("DEBUG: Broadcasting message to participants:", conversation.participants);
        console.log("DEBUG: Message sender:", message.sender._id);
        console.log("DEBUG: Current socket user:", socket.userId);

        // Broadcast to all other participants in the conversation (excluding sender)
        conversation.participants.forEach((participant) => {
          if (participant.toString() !== message.sender._id.toString() && io.onlineUsers[participant]) {
            console.log("DEBUG: Sending message to participant:", participant);
            io.to(io.onlineUsers[participant]).emit("receive-message", {
              ...message,
              conversationId: conversationId
            });
          } else {
            console.log("DEBUG: Skipping participant (sender or offline):", participant);
          }
        });
      } catch (err) {
        console.error("Error handling broadcast-message:", err);
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id, "User:", socket.userId);
      
      // Use the authenticated user ID from socket
      const authenticatedUserId = socket.userId;
      if (authenticatedUserId && io.onlineUsers[authenticatedUserId]) {
        try {
          // Check if database is connected before attempting operations
          const mongoose = require('mongoose');
          if (mongoose.connection.readyState === 1) {
            // Update user's offline status in database with timeout handling
            const updatePromise = User.findByIdAndUpdate(authenticatedUserId, {
              isOnline: false,
              lastSeen: new Date()
            }, { 
              new: true,
              timeout: 5000 // 5 second timeout
            });

            // Use Promise.race to handle timeout
            await Promise.race([
              updatePromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database update timeout')), 5000)
              )
            ]);
            console.log(`User ${authenticatedUserId} is now offline`);
          } else {
            console.log(`User ${authenticatedUserId} is now offline (DB not connected, status cached)`);
          }

          // Emit to all other users that this user is offline
          socket.broadcast.emit("user-offline", authenticatedUserId);
          
          delete io.onlineUsers[authenticatedUserId];
        } catch (error) {
          console.error("Error updating user offline status:", error.message);
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
