const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
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
          "ws://localhost:5000",
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
      "http://localhost:5173"
      
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 500,
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

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
