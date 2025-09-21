const express = require("express");
const router = express.Router();

const {
  createShipment,
  getShipments,
  getShipmentHistory,
  getShipmentById,
  updateShipmentStatus,
  getAvailableShipmentsForCarrier,
  getPublicOpenShipments, // New: Import the public open shipments function
  markAsDeliveredByLogistics,
  markAsDeliveredByUser,
  getDeliveredShipments, // New: Import the delivered shipments function
  getActiveShipmentsForLogistics, // New: Import the active shipments function
  deleteShipment, // New: Import the delete shipment function
  getLogisticsHistory, // New: Import the logistics history function
  rateCompletedShipment, // New: Import the rate completed shipment function
  getLogisticsRatings, // New: Import the get logistics ratings function
  updateShipmentLocation, // New: Import location tracking functions
  getShipmentTracking,
  startTracking,
  stopTracking,
  getPublicShipmentTracking, // New: Import public tracking function
} = require("../controllers/shipmentController");

const { protect, allowRoles } = require("../middlewares/authMiddleware"); // Destructure both protect and allowRoles
const upload = require("../middlewares/uploadMiddleware");
const { locationUpdateRateLimit } = require("../middlewares/locationRateLimit");

const shipmentUpload = upload.fields([
  { name: "photos", maxCount: 10 },
  { name: "documents", maxCount: 10 },
]);

// Routes
router.post("/", protect, shipmentUpload, createShipment);
router.get("/", protect, getShipments);
router.get("/history", protect, getShipmentHistory); // 👈 new

// Public route for browsing open shipments (no authentication required)
router.get("/public/open-shipments", getPublicOpenShipments);

// New: Route for carriers to fetch available shipments for bidding (MUST come before /:id)
router.get("/available-for-bidding", protect, getAvailableShipmentsForCarrier);

// New: Route for logistics companies to get their active shipments
router.get(
  "/my-active-shipments",
  protect,
  allowRoles("logistics"),
  getActiveShipmentsForLogistics
);

// New: Route for logistics companies to get their history
router.get(
  "/logistics-history",
  protect,
  allowRoles("logistics"),
  getLogisticsHistory
);

// New: Route for users and logistics to get delivered shipments awaiting confirmation
router.get(
  "/delivered",
  protect,
  allowRoles("user", "logistics"),
  getDeliveredShipments
);

// New: Route for logistics companies to get their ratings (MUST come before /:id)
router.get(
  "/my-ratings",
  protect,
  allowRoles("logistics"),
  (req, res, next) => {
    console.log(
      "🔍 Ratings route hit - User:",
      req.user?.email,
      "Role:",
      req.user?.role
    );
    next();
  },
  getLogisticsRatings
);

router.get("/:id", protect, getShipmentById);
router.put("/:id/status", protect, updateShipmentStatus);
router.delete("/:id", protect, deleteShipment); // New: Route to delete shipment
// Removed: markAsDeliveredAndRate route (replaced with separate rate and deliver routes)
router.put(
  "/:id/mark-delivered-by-logistics",
  protect,
  allowRoles("logistics"),
  markAsDeliveredByLogistics
); // New: Route for logistics to mark as delivered
router.put(
  "/:id/mark-delivered-by-user",
  protect,
  allowRoles("user"),
  markAsDeliveredByUser
); // New: Route for users to mark as delivered
router.put("/:id/rate", protect, allowRoles("user"), rateCompletedShipment); // New: Route for users to rate completed shipments

// Location tracking routes
router.post(
  "/:id/location",
  protect,
  allowRoles("logistics"),
  locationUpdateRateLimit,
  updateShipmentLocation
); // Update location with rate limiting
router.get("/:id/tracking", protect, getShipmentTracking); // Get tracking data
router.post(
  "/:id/start-tracking",
  protect,
  allowRoles("user", "logistics", "admin"),
  startTracking
); // Start tracking
router.post(
  "/:id/stop-tracking",
  protect,
  allowRoles("user", "logistics", "admin"),
  stopTracking
); // Stop tracking

// Public tracking route (no authentication required)
router.get("/:id/public-tracking", getPublicShipmentTracking); // Public tracking data

module.exports = router;
