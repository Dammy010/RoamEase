const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log(`DEBUG: Auth middleware - ${req.method} ${req.url}`);
    console.log("DEBUG: Authorization header:", req.headers.authorization ? "Present" : "Missing");
    console.log("DEBUG: Token extracted:", token ? "Present" : "Missing");

    if (!token) {
      console.log("DEBUG: No token provided for protected route");
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG: Token decoded successfully, user ID:", decoded.id);

    // Find user and exclude sensitive fields
    const user = await User.findById(decoded.id).select("-password -__v");

    if (!user) {
      console.log("DEBUG: User not found in database for ID:", decoded.id);
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    console.log("DEBUG: authMiddleware - User authenticated:", user.email, "Role:", user.role);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    console.error("Error type:", error.name);

    return res.status(401).json({
      message: error.name === "TokenExpiredError"
        ? "Not authorized, token expired"
        : "Not authorized, token invalid",
    });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient role.' });
    }
    next();
  };
};

module.exports = { protect, allowRoles };
