const User = require("../models/User");

/**
 * Middleware to check if user's email is verified
 * Use this to protect routes that require verified email
 */
const requireEmailVerification = async (req, res, next) => {
  try {
    // Get user ID from the authenticated request (set by authMiddleware)
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    // Find user and check verification status
    const user = await User.findById(userId).select(
      "email isVerified verificationTokenExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      const now = new Date();
      const hasValidToken =
        user.verificationTokenExpires && user.verificationTokenExpires > now;
      const timeLeft = hasValidToken
        ? Math.ceil((user.verificationTokenExpires - now) / (1000 * 60))
        : 0;

      return res.status(403).json({
        message: "Email verification required to access this feature",
        code: "EMAIL_VERIFICATION_REQUIRED",
        isVerified: false,
        email: user.email,
        hasValidToken,
        timeLeft: timeLeft > 0 ? `${timeLeft} minutes` : null,
        canResend: !hasValidToken || timeLeft <= 0,
      });
    }

    // Email is verified, proceed to next middleware
    next();
  } catch (error) {
    console.error("Email verification middleware error:", error);
    res.status(500).json({
      message: "Something went wrong while checking email verification",
      code: "INTERNAL_ERROR",
    });
  }
};

/**
 * Middleware to optionally check email verification status
 * Adds verification info to request without blocking access
 */
const checkEmailVerification = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (userId) {
      const user = await User.findById(userId).select(
        "email isVerified verificationTokenExpires"
      );

      if (user) {
        const now = new Date();
        const hasValidToken =
          user.verificationTokenExpires && user.verificationTokenExpires > now;
        const timeLeft = hasValidToken
          ? Math.ceil((user.verificationTokenExpires - now) / (1000 * 60))
          : 0;

        // Add verification info to request
        req.emailVerification = {
          isVerified: user.isVerified,
          email: user.email,
          hasValidToken,
          timeLeft: timeLeft > 0 ? `${timeLeft} minutes` : null,
          canResend: !hasValidToken || timeLeft <= 0,
        };
      }
    }

    next();
  } catch (error) {
    console.error("Check email verification middleware error:", error);
    // Don't block the request, just log the error
    next();
  }
};

module.exports = {
  requireEmailVerification,
  checkEmailVerification,
};
