// backend/controllers/adminController.js
const User = require("../models/User");
const Shipment = require("../models/Shipment");
const Bid = require("../models/Bid");
const Dispute = require("../models/Dispute");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/**
 * GET /api/admin/users
 * Query: search, role=user|logistics|admin, page, limit
 */
exports.listUsers = async (req, res) => {
  try {
    const { search = "", role, page = 1, limit = 20 } = req.query;
    const q = {};
    if (role) q.role = role;
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      User.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-password"),
      User.countDocuments(q),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

/**
 * GET /api/admin/logistics
 * Query: status=pending|verified|rejected|all
 */
exports.listLogistics = async (req, res) => {
  try {
    const { status = "all", search = "", page = 1, limit = 20 } = req.query;
    const q = { role: "logistics" };

    if (status !== "all") q.verificationStatus = status;
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      User.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-password"),
      User.countDocuments(q),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logistics", error: err.message });
  }
};

/**
 * PATCH /api/admin/verify-logistics/:id
 * Body: { action: "verify"|"reject", notes?: string }
 */
exports.verifyLogistics = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const logistics = await User.findById(id);
    if (!logistics || logistics.role !== "logistics") {
      return res.status(404).json({ message: "Logistics account not found" });
    }

    if (!["verify", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    logistics.verificationStatus = action === "verify" ? "verified" : "rejected";
    logistics.isVerified = action === "verify";
    logistics.verificationNotes = notes || "";

    await logistics.save();

    res.json({
      message: `Logistics ${action === "verify" ? "verified" : "rejected"} successfully`,
      logistics: {
        _id: logistics._id,
        name: logistics.name,
        email: logistics.email,
        companyName: logistics.companyName,
        role: logistics.role,
        isVerified: logistics.isVerified,
        verificationStatus: logistics.verificationStatus,
        verificationNotes: logistics.verificationNotes,
        documents: logistics.documents,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

/**
 * GET /api/admin/disputes
 * Query: status=open|in_review|resolved|all
 */
exports.listDisputes = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 20 } = req.query;
    const q = {};
    if (status !== "all") q.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Dispute.find(q)
        .populate("reporter", "name email role")
        .populate("against", "name email role")
        .populate("shipment", "reference status origin destination")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Dispute.countDocuments(q),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch disputes", error: err.message });
  }
};

/**
 * PATCH /api/admin/disputes/:id/resolve
 * Body: { status: "in_review"|"resolved", adminNotes?: string, resolution?: string }
 */
exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, resolution } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    if (!["in_review", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    dispute.status = status;
    if (adminNotes !== undefined) dispute.adminNotes = adminNotes;
    if (resolution !== undefined) dispute.resolution = resolution;

    await dispute.save();

    res.json({ message: "Dispute updated", dispute });
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve dispute", error: err.message });
  }
};

/**
 * GET /api/admin/analytics
 * Returns quick KPIs for PlatformAnalytics.jsx
 */
exports.platformAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLogistics,
      verifiedLogistics,
      pendingLogistics,
      totalShipments,
      openShipments,
      acceptedShipments,
      completedShipments,
      deliveredShipments,
      totalBids,
      disputesOpen,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "logistics" }),
      User.countDocuments({ role: "logistics", verificationStatus: "verified" }),
      User.countDocuments({ role: "logistics", verificationStatus: "pending" }),
      Shipment.countDocuments({}),
      Shipment.countDocuments({ status: "open" }),
      Shipment.countDocuments({ status: "accepted" }),
      Shipment.countDocuments({ status: "completed" }),
      Shipment.countDocuments({ status: "delivered" }),
      Bid.countDocuments({}),
      Dispute.countDocuments({ status: "open" }),
    ]);

    // Calculate completed shipments (both completed and delivered statuses)
    const completedShipmentsTotal = completedShipments + deliveredShipments;

    res.json({
      users: { total: totalUsers },
      logistics: {
        total: totalLogistics,
        verified: verifiedLogistics,
        pending: pendingLogistics,
      },
      shipments: {
        total: totalShipments,
        open: openShipments,
        accepted: acceptedShipments,
        completed: completedShipmentsTotal, // Now includes both completed and delivered
        completedOnly: completedShipments,
        delivered: deliveredShipments,
        // Status breakdown for detailed analytics
        statusBreakdown: {
          open: openShipments,
          accepted: acceptedShipments,
          completed: completedShipments,
          delivered: deliveredShipments
        }
      },
      bids: { total: totalBids },
      disputes: { open: disputesOpen },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
};

exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch total users", error: err.message });
  }
};

exports.getNormalUsersCount = async (req, res) => {
  try {
    const normalUsersCount = await User.countDocuments({ role: "user" });
    res.json({ normalUsersCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch normal users count", error: err.message });
  }
};

/**
 * GET /api/admin/shipments
 * Query: search, status=open|accepted|completed|delivered|received|all, page, limit
 */
exports.getAllShipments = async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 20 } = req.query;
    const q = {};

    console.log("DEBUG: getAllShipments - Query params:", { search, status, page, limit });

    if (status !== "all") q.status = status;

    if (search) {
      q.$or = [
        { shipmentTitle: { $regex: search, $options: "i" } },
        { pickupAddress: { $regex: search, $options: "i" } },
        { deliveryAddress: { $regex: search, $options: "i" } },
        { pickupCity: { $regex: search, $options: "i" } },
        { deliveryCity: { $regex: search, $options: "i" } },
      ];
    }

    console.log("DEBUG: getAllShipments - MongoDB query:", JSON.stringify(q, null, 2));

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Shipment.find(q)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Shipment.countDocuments(q),
    ]);

    console.log("DEBUG: getAllShipments - Found items:", items.length, "Total:", total);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("ERROR: getAllShipments - Error:", err);
    res.status(500).json({ message: "Failed to fetch shipments", error: err.message });
  }
};

/**
 * GET /api/admin/bids
 * Query: shipmentId, page, limit
 */
exports.getBidsForAdmin = async (req, res) => {
  try {
    console.log("DEBUG: getBidsForAdmin - Request received");
    const { shipmentId, page = 1, limit = 20 } = req.query;
    const q = {};

    if (shipmentId) {
      q.shipment = shipmentId;
    }

    console.log("DEBUG: getBidsForAdmin - Query:", q);

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Bid.find(q)
        .populate("carrier", "name email role companyName country phone")
        .populate("shipment", "shipmentTitle status pickupAddress deliveryAddress pickupCity deliveryCity typeOfGoods weight budget createdAt user modeOfTransport")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Bid.countDocuments(q),
    ]);

    console.log("DEBUG: getBidsForAdmin - Found bids:", items.length);
    console.log("DEBUG: getBidsForAdmin - Sample bid:", items[0]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("ERROR: getBidsForAdmin - Error fetching bids:", err);
    res.status(500).json({ message: "Failed to fetch bids", error: err.message });
  }
};

/**
 * GET /api/admin/conversations
 * Query: page, limit
 */
exports.getAllConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Conversation.find()
        .populate("participants", "name email role profilePicture companyName contactName contactPosition country yearsInOperation registrationNumber companySize")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Conversation.countDocuments({}),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch conversations", error: err.message });
  }
};

/**
 * GET /api/admin/conversations/:id/messages
 * Query: page, limit
 */
exports.getMessagesInConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversation: id })
        .populate("sender", "name email role profilePicture companyName contactName contactPosition country yearsInOperation registrationNumber companySize")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments({ conversation: id }),
    ]);

    res.json({
      messages,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};

exports.dashboardSummary = async (req, res) => {
  try {
    const [users, logisticsPending, logisticsVerified, disputes, analytics] = await Promise.all([
      User.find().sort({ createdAt: -1 }).select("-password"),
      User.find({ role: "logistics", verificationStatus: "pending" }).sort({ createdAt: -1 }),
      User.find({ role: "logistics", verificationStatus: "verified" }).sort({ createdAt: -1 }),
      Dispute.find()
        .populate("reporter", "name email role")
        .populate("against", "name email role")
        .populate("shipment", "reference status origin destination")
        .sort({ createdAt: -1 }),
      (async () => {
        const [
          totalUsers,
          totalLogistics,
          verifiedLogisticsCount,
          pendingLogisticsCount,
          totalShipments,
          openShipments,
          acceptedShipments,
          completedShipments,
          deliveredShipments,
          totalBids,
          disputesOpen,
          normalUsersCount,
        ] = await Promise.all([
          User.countDocuments({}),
          User.countDocuments({ role: "logistics" }),
          User.countDocuments({ role: "logistics", verificationStatus: "verified" }),
          User.countDocuments({ role: "logistics", verificationStatus: "pending" }),
          Shipment.countDocuments({}),
          Shipment.countDocuments({ status: "open" }),
          Shipment.countDocuments({ status: "accepted" }),
          Shipment.countDocuments({ status: "completed" }),
          Shipment.countDocuments({ status: "delivered" }),
          Shipment.countDocuments({ status: "received" }),
          Bid.countDocuments({}),
          Dispute.countDocuments({ status: "open" }),
          User.countDocuments({ role: "user" }), // Fetch normal users count
        ]);

        // Calculate completed shipments (both completed and delivered statuses)
        const completedShipmentsTotal = completedShipments + deliveredShipments;

        console.log('DEBUG - dashboardSummary: Fetched verifiedLogisticsCount:', verifiedLogisticsCount);
        console.log('DEBUG - dashboardSummary: Fetched pendingLogisticsCount:', pendingLogisticsCount);

        return {
          users: { total: totalUsers, normalUsersCount: normalUsersCount },
          logistics: { total: totalLogistics, verified: verifiedLogisticsCount, pending: pendingLogisticsCount },
          shipments: { 
            total: totalShipments, 
            open: openShipments, 
            accepted: acceptedShipments,
            completed: completedShipmentsTotal, // Now includes both completed and delivered
            completedOnly: completedShipments,
            delivered: deliveredShipments,
            statusBreakdown: {
              open: openShipments,
              accepted: acceptedShipments,
              completed: completedShipments,
              delivered: deliveredShipments
            }
          },
          bids: { total: totalBids },
          disputes: { open: disputesOpen },
        };
      })(),
    ]);

    console.log('DEBUG - dashboardSummary: logisticsPending (users array):', logisticsPending);
    console.log('DEBUG - dashboardSummary: logisticsVerified (users array):', logisticsVerified);
    console.log('DEBUG - dashboardSummary: Final analytics object:', analytics);

    res.json({
      users,
      logisticsPending,
      logisticsVerified,
      disputes,
      analytics,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard summary", error: err.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete user with ID: ${id}`);

    const user = await User.findById(id);
    if (!user) {
      console.log(`User with ID: ${id} not found.`);
      return res.status(404).json({ message: "User not found" });
    }
    console.log('Found user for deletion:', user);

    // Prevent admin from deleting themselves or other admins accidentally
    if (user.role === "admin") {
      // You might want a more sophisticated check here, e.g., if it's the *only* admin
      console.log(`Attempted to delete admin user with ID: ${id}. Operation forbidden.`);
      return res.status(403).json({ message: "Cannot delete an administrator account." });
    }

    // Delete related data to prevent orphans
    console.log(`Deleting shipments created by user ${id}...`);
    await Shipment.deleteMany({ user: id });
    console.log(`Shipments by user ${id} deleted.`);

    console.log(`Deleting bids made by user ${id}...`);
    await Bid.deleteMany({ carrier: id });
    console.log(`Bids by user ${id} deleted.`);

    console.log(`Deleting messages sent by user ${id}...`);
    await Message.deleteMany({ sender: id });
    console.log(`Messages sent by user ${id} deleted.`);

    // Remove user from all conversations and delete conversations if empty
    console.log(`Processing conversations involving user ${id}...`);
    const conversations = await Conversation.find({ participants: id });
    for (const conversation of conversations) {
      console.log(`Processing conversation ID: ${conversation._id}`);
      conversation.participants = conversation.participants.filter(p => p.toString() !== id);
      
      // Filter out unreadCounts entries associated with the deleted user
      conversation.unreadCounts = conversation.unreadCounts.filter(uc => uc.user && uc.user.toString() !== id);
      
      if (conversation.participants.length === 0) {
        console.log(`Conversation ${conversation._id} is now empty. Deleting messages and conversation.`);
        await Message.deleteMany({ conversation: conversation._id });
        await conversation.deleteOne(); // Use deleteOne() instead of remove()
      } else {
        console.log(`Conversation ${conversation._id} still has participants. Saving changes.`);
        await conversation.save();
      }
    }
    console.log(`Finished processing conversations for user ${id}.`);
    
    // Finally, delete the user
    console.log(`Attempting to delete user document for ID: ${id}...`);
    await user.deleteOne(); // Use deleteOne() instead of remove()
    console.log(`User document for ID: ${id} deleted successfully.`);

    res.json({ message: "User deleted successfully", userId: id });
  } catch (err) {
    console.error("ERROR in deleteUser:", err);
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};

/**
 * PATCH /api/admin/users/:id/suspend
 * Body: { status: "active"|"suspended" }
 */
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot suspend/activate an administrator account." });
    }

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided. Must be 'active' or 'suspended'." });
    }

    user.isActive = status === "active";
    await user.save();

    res.json({ message: `User account ${user.isActive ? 'activated' : 'suspended'} successfully`, _id: user._id, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user status", error: err.message });
  }
};

/**
 * PATCH /api/admin/users/:id
 * Body: { name, email, phoneNumber, companyName, etc. }
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin" && req.user.id !== user.id) {
      // Only the admin themselves can edit their own profile via this route
      return res.status(403).json({ message: "Unauthorized to edit another administrator's account." });
    }

    // Prevent changing role via this route
    if (updates.role) {
      delete updates.role;
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(id).select("-password");

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};
