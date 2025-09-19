const rateLimit = require("express-rate-limit");

// Rate limiting for location updates (1 update every 5 seconds)
const locationUpdateRateLimit = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1, // 1 request per window
  message: {
    success: false,
    message:
      "Location update rate limit exceeded. Please wait before sending another update.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator based on user ID and shipment ID
  keyGenerator: (req) => {
    return `location_update:${req.user._id}:${req.params.id}`;
  },
  // Skip successful requests from rate limit count
  skipSuccessfulRequests: false,
  // Skip failed requests from rate limit count
  skipFailedRequests: true,
});

module.exports = {
  locationUpdateRateLimit,
};
