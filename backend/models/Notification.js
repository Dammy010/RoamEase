const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Recipient information
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification type and category
    type: {
      type: String,
      required: true,
      enum: [
        // User notifications
        "shipment_created",
        "shipment_updated",
        "shipment_deleted",
        "shipment_cancelled",
        "shipment_status_updated",
        "shipment_assigned",
        "bid_received",
        "bid_accepted",
        "bid_rejected",
        "price_update_request",
        "price_update_response",
        "shipment_rated",
        "shipment_delivered",
        "shipment_delivered",
        "payment_received",
        "payment_failed",
        "dispute_created",
        "dispute_resolved",
        "verification_approved",
        "verification_rejected",
        "account_suspended",
        "account_reactivated",

        // Chat notifications
        "new_message",
        "message_received",
        "conversation_started",
        "conversation_updated",

        // Logistics notifications
        "new_shipment_available",
        "shipment_updated",
        "shipment_deleted",
        "shipment_cancelled",
        "shipment_status_updated",
        "shipment_assigned",
        "bid_placed",
        "bid_accepted",
        "bid_rejected",
        "shipment_picked_up",
        "shipment_delivered",
        "shipment_delivered",
        "payment_processed",
        "dispute_created",
        "dispute_resolved",
        "verification_approved",
        "verification_rejected",
        "account_suspended",
        "account_reactivated",

        // Report notifications
        "report_created",
        "report_updated",
        "report_resolved",
        "report_closed",
        "report_rejected",

        // Tracking notifications
        "tracking_started",
        "tracking_stopped",
        "tracking_location_update",
        "tracking_milestone_reached",

        // Admin notifications
        "new_user_registered",
        "new_logistics_registered",
        "verification_requested",
        "shipment_created",
        "shipment_updated",
        "shipment_deleted",
        "shipment_cancelled",
        "shipment_status_updated",
        "shipment_delivered",
        "dispute_created",
        "dispute_escalated",
        "payment_issue",
        "system_alert",
        "high_volume_activity",
        "suspicious_activity",
        "platform_maintenance",
        "feature_update",
        "policy_update",
      ],
    },

    // Notification content
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Related entities
    relatedEntity: {
      type: {
        type: String,
        enum: [
          "shipment",
          "bid",
          "payment",
          "dispute",
          "user",
          "system",
          "report",
        ],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },

    // Notification status
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Action buttons (optional)
    actions: [
      {
        label: String,
        action: String, // 'view', 'accept', 'reject', 'dismiss'
        url: String,
        method: String, // 'GET', 'POST', 'PUT', 'DELETE'
      },
    ],

    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    // Timestamps
    readAt: {
      type: Date,
    },

    archivedAt: {
      type: Date,
    },

    // Expiration (for time-sensitive notifications)
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted date
notificationSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Virtual for time ago
notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Methods
notificationSchema.methods.markAsRead = function () {
  this.status = "read";
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsArchived = function () {
  this.status = "archived";
  this.archivedAt = new Date();
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ recipient: userId, status: "unread" });
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { recipient: userId, status: "unread" },
    { status: "read", readAt: new Date() }
  );
};

notificationSchema.statics.getUserNotifications = function (
  userId,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("recipient", "name email role")
    .lean();
};

module.exports = mongoose.model("Notification", notificationSchema);
