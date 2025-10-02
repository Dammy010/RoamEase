const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  checkVerificationStatus,
  getEmailAnalyticsData,
  forgotPassword,
  validateResetCode,
  resetPassword,
  deleteProfilePicture,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware"); // Destructure protect
const { upload } = require("../middlewares/cloudinaryUploadMiddleware");

// Consolidate all possible file uploads for profile update into one fields middleware
const profileUpdateUpload = upload.fields([
  { name: "profilePicture", maxCount: 1 }, // Single profile picture
  { name: "businessLicense", maxCount: 1 },
  { name: "insuranceCertificate", maxCount: 1 },
  { name: "governmentId", maxCount: 1 },
]);

// Public Routes
router.post("/register", profileUpdateUpload, registerUser); // Use for register too, as it handles documents
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/verify", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.get("/verification-status", checkVerificationStatus);
router.post("/forgot-password", forgotPassword);
router.post("/validate-reset-code", validateResetCode);
router.post("/reset-password", resetPassword);

// Private Routes
router.get("/profile", protect, getProfile);
// Use the new consolidated profileUpdateUpload middleware
router.put("/profile", protect, profileUpdateUpload, updateProfile);
router.get("/email-analytics", protect, getEmailAnalyticsData);

// Profile Picture Routes (moved to profileRoutes.js to avoid conflicts)
// router.post("/upload-profile-picture", protect, upload.single('profilePicture'), uploadProfilePicture);
router.delete("/profile-picture", protect, deleteProfilePicture);

module.exports = router;
