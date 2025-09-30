// JWT Token Debug Utility
// This file helps debug JWT token issues

const jwt = require("jsonwebtoken");

/**
 * Debug JWT token without verification
 * @param {string} token - JWT token to debug
 * @returns {object} Debug information
 */
const debugToken = (token) => {
  if (!token) {
    console.log("❌ No token provided");
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("❌ Invalid token format - should have 3 parts");
      return null;
    }

    const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;

    const debugInfo = {
      header,
      payload,
      isExpired,
      exp: payload.exp,
      now: now,
      timeUntilExpiry: payload.exp - now,
      tokenIssuedAt: new Date(payload.iat * 1000).toISOString(),
      tokenExpiresAt: new Date(payload.exp * 1000).toISOString(),
      tokenPreview: token.substring(0, 20) + "...",
    };

    console.log("🔍 Token Debug Info:", debugInfo);
    return debugInfo;
  } catch (error) {
    console.error("❌ Error parsing token:", error.message);
    return null;
  }
};

/**
 * Verify JWT token with detailed error reporting
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret
 * @returns {object} Verification result
 */
const verifyTokenWithDebug = (token, secret) => {
  if (!token) {
    return { success: false, error: "No token provided" };
  }

  if (!secret) {
    return { success: false, error: "No secret provided" };
  }

  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      decoded,
      debug: debugToken(token),
    };
  } catch (error) {
    const debug = debugToken(token);
    return {
      success: false,
      error: error.message,
      errorName: error.name,
      debug,
    };
  }
};

/**
 * Check if JWT_SECRET is properly configured
 * @returns {object} Secret configuration info
 */
const checkJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  const info = {
    hasJWT_SECRET: !!secret,
    hasJWT_REFRESH_SECRET: !!refreshSecret,
    jwtSecretLength: secret?.length || 0,
    refreshSecretLength: refreshSecret?.length || 0,
    jwtSecretPreview: secret ? secret.substring(0, 10) + "..." : "none",
    refreshSecretPreview: refreshSecret
      ? refreshSecret.substring(0, 10) + "..."
      : "none",
  };

  console.log("🔍 JWT Secret Configuration:", info);
  return info;
};

module.exports = {
  debugToken,
  verifyTokenWithDebug,
  checkJWTSecret,
};
