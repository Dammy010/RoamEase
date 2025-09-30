// JWT Token Test Script
// Run this in your backend to test JWT token generation and verification

const jwt = require("jsonwebtoken");
const {
  debugToken,
  verifyTokenWithDebug,
  checkJWTSecret,
} = require("./utils/jwtDebug");

console.log("🔍 Testing JWT Token Generation and Verification");
console.log("=".repeat(50));

// 1. Check JWT Secret Configuration
console.log("\n1. Checking JWT Secret Configuration:");
const secretInfo = checkJWTSecret();

if (!secretInfo.hasJWT_SECRET) {
  console.log(
    "❌ JWT_SECRET not found! Please set it in your environment variables."
  );
  process.exit(1);
}

// 2. Generate a test token
console.log("\n2. Generating test token:");
const testUserId = "507f1f77bcf86cd799439011"; // Sample user ID
const testToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET, {
  expiresIn: "1h",
});

console.log("✅ Test token generated:", {
  tokenPreview: testToken.substring(0, 20) + "...",
  tokenLength: testToken.length,
  userId: testUserId,
});

// 3. Debug the token
console.log("\n3. Debugging token structure:");
const debugInfo = debugToken(testToken);

// 4. Verify the token
console.log("\n4. Verifying token:");
const verification = verifyTokenWithDebug(testToken, process.env.JWT_SECRET);

if (verification.success) {
  console.log("✅ Token verification successful!");
  console.log("Decoded payload:", verification.decoded);
} else {
  console.log("❌ Token verification failed:", verification.error);
}

// 5. Test with expired token
console.log("\n5. Testing with expired token:");
const expiredToken = jwt.sign(
  { id: testUserId },
  process.env.JWT_SECRET,
  { expiresIn: "-1h" } // Expired 1 hour ago
);

const expiredVerification = verifyTokenWithDebug(
  expiredToken,
  process.env.JWT_SECRET
);
if (!expiredVerification.success) {
  console.log(
    "✅ Correctly detected expired token:",
    expiredVerification.error
  );
} else {
  console.log("❌ Failed to detect expired token!");
}

// 6. Test with invalid token
console.log("\n6. Testing with invalid token:");
const invalidToken = "invalid.token.here";
const invalidVerification = verifyTokenWithDebug(
  invalidToken,
  process.env.JWT_SECRET
);
if (!invalidVerification.success) {
  console.log(
    "✅ Correctly detected invalid token:",
    invalidVerification.error
  );
} else {
  console.log("❌ Failed to detect invalid token!");
}

console.log("\n" + "=".repeat(50));
console.log("🎉 JWT Token Test Complete!");

// Export for use in other scripts
module.exports = {
  testToken: testToken,
  testUserId: testUserId,
  debugInfo: debugInfo,
};
