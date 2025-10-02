const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
require("express-async-errors");

// 🎨 Beautiful utilities
const Logger = require("./utils/logger");
const BeautifulErrorHandler = require("./middlewares/beautifulErrorHandler");

// Core modules
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

// Load env
dotenv.config();

// --- Set defaults if missing ---
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "fallback-jwt-secret-change-in-production";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "fallback-refresh-jwt-secret-change-in-production";
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/roamease";
process.env.CLIENT_URL =
  process.env.CLIENT_URL || "https://roam-ease.vercel.app";

// --- Create necessary directories ---
const createDirectories = () => {
  const directories = [
    "uploads",
    "uploads/profiles",
    "uploads/shipments",
    "uploads/documents",
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// Create directories on startup
createDirectories();

// 🎨 Beautiful startup banner
Logger.startupBanner();

// Warnings for weak/fallback secrets
if (process.env.JWT_SECRET.includes("fallback")) {
  Logger.warn(
    "⚠️  WARNING: Using fallback JWT_SECRET. Set proper secret in .env!"
  );
}
if (process.env.JWT_REFRESH_SECRET.includes("fallback")) {
  Logger.warn(
    "⚠️  WARNING: Using fallback JWT_REFRESH_SECRET. Set proper secret in .env!"
  );
}

// Init express + server
const app = express();
const server = http.createServer(app);

// Init Socket.IO
initSocket(server);

// DB connection
connectDB();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "*"],
        "connect-src": [
          "'self'",
          process.env.CLIENT_URL,
          "https://roamease-3wg1.onrender.com",
          "wss://roamease-3wg1.onrender.com",
          "http://localhost:5000",
          "ws://localhost:5000",
          "http://localhost:5173",
          "ws://localhost:5173",
        ],
      },
    },
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
// 🎨 Beautiful request logging
app.use(Logger.logRequest);
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "https://roam-ease.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root route
app.get("/", (req, res) => {
  res.send("ROAMEASE backend is running ✅");
});

// Log requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enhanced Rate Limiting Configuration
const createRateLimiter = (windowMs, max, message, skipCondition = null) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "Rate limit exceeded",
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipCondition,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          return `user:${decoded.id}`;
        } catch (error) {
          // Use IP as fallback - use the proper IPv6 helper
          return rateLimit.ipKeyGenerator(req);
        }
      }
      // Use IP - use the proper IPv6 helper
      return rateLimit.ipKeyGenerator(req);
    },
  });
};

// General API rate limiter - More generous for production
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX) || 1000, // 1000 requests per 15 minutes
  "Too many requests from this IP/user, please try again later.",
  (req) => {
    // Skip rate limiting for localhost in development
    const isLocalhost =
      req.ip === "127.0.0.1" ||
      req.ip === "::1" ||
      req.ip === "::ffff:127.0.0.1";
    if (isLocalhost && process.env.NODE_ENV !== "production") {
      console.log(`🔓 Skipping rate limit for localhost: ${req.ip}`);
      return true;
    }
    return false;
  }
);

// Stricter rate limiter for auth endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // 50 auth requests per 15 minutes
  "Too many authentication attempts, please try again later."
);

// Apply rate limiters
// Apply rate limiting (temporarily disabled for debugging)
// app.use("/api", generalLimiter);
// app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/debug", require("./routes/debugRoutes"));

// Error handling
const { notFound, errorHandler } = require("./middlewares/errorHandler");
// 🎨 Beautiful error handling
app.use(BeautifulErrorHandler.handleNotFound);
app.use(BeautifulErrorHandler.handleError);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  Logger.success(`🚀 Server running on port ${PORT}`);
  Logger.info(
    `📡 API endpoints: ${
      process.env.BASE_URL || `http://localhost:${PORT}`
    }/api`
  );
  Logger.info(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  Logger.warn("🛑 Server shutting down...");
  server.close(() => {
    Logger.info("✅ Server closed gracefully");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  Logger.warn("🛑 Server shutting down...");
  server.close(() => {
    Logger.info("✅ Server closed gracefully");
    process.exit(0);
  });
});
