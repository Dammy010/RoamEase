const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middlewares/authMiddleware");
const {
  listUsers,
  listLogistics,
  verifyLogistics,
  listDisputes,
  resolveDispute,
  platformAnalytics,
  dashboardSummary, // ✅ new controller
  getTotalUsers,
  getNormalUsersCount,
  getAllShipments,
  getBidsForAdmin,
  getAllConversations,
  getMessagesInConversation,
  deleteUser,
  suspendUser,
  updateUser,
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(protect, allowRoles("admin"));

// User management
router.get("/users", listUsers);
router.get("/users/total", getTotalUsers);
router.get("/users/normal-count", getNormalUsersCount);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id", updateUser);

// Chat management
router.get("/conversations", getAllConversations);
router.get("/conversations/:id/messages", getMessagesInConversation);

// Bid management
router.get("/bids", getBidsForAdmin);

// Shipment management
router.get("/shipments", getAllShipments);

// Logistics management
router.get("/logistics", listLogistics);
router.patch("/users/:id/verify", verifyLogistics);

// Disputes management
router.get("/disputes", listDisputes);
router.patch("/disputes/:id/resolve", resolveDispute);

// Analytics dashboard
router.get("/analytics", platformAnalytics);

// ✅ New route: single endpoint for dashboard summary
router.get("/dashboard-summary", dashboardSummary);

module.exports = router;
