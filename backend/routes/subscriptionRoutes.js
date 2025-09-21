const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");
const {
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription,
  upgradeSubscription,
  getAllSubscriptions,
  cleanupFailedSubscriptions,
  emergencyCleanup,
  clearReferenceCache,
} = require("../controllers/subscriptionController");

// All routes require authentication
router.use(protect);

// Create new subscription
router.post("/create", createSubscription);

// Confirm subscription payment
router.post("/confirm", confirmSubscription);

// Get user subscriptions
router.get("/my-subscriptions", getUserSubscriptions);

// Get all subscriptions (admin only)
router.get("/all", allowRoles(["admin"]), getAllSubscriptions);

// Cancel subscription
router.delete("/:subscriptionId/cancel", cancelSubscription);

// Upgrade subscription
router.post("/upgrade", upgradeSubscription);

// Clean up failed subscriptions (admin utility)
router.post("/cleanup-failed", cleanupFailedSubscriptions);

// Emergency cleanup - remove ALL pending subscriptions (use with caution)
router.post("/emergency-cleanup", emergencyCleanup);

// Clear reference cache
router.post("/clear-cache", clearReferenceCache);

module.exports = router;
