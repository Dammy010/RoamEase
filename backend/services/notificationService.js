const Notification = require("../models/Notification");
const User = require("../models/User");
const emailService = require("../utils/emailService");
const smsService = require("./smsService");
const pushService = require("./pushService");

class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(notificationData) {
    try {
      // Validate required fields
      if (
        !notificationData.recipient ||
        !notificationData.type ||
        !notificationData.title
      ) {
        throw new Error(
          "Missing required notification fields: recipient, type, title"
        );
      }

      console.log("🔍 Creating notification with data:", {
        recipient: notificationData.recipient,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        metadata: notificationData.metadata,
      });

      const notification = new Notification(notificationData);
      await notification.save();

      console.log(`✅ Notification created successfully:`, {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        recipient: notification.recipient,
        createdAt: notification.createdAt,
      });

      // Get user preferences and send through appropriate channels
      await this.sendNotificationThroughChannels(notification);

      return notification;
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Send notification through user's preferred channels
   */
  static async sendNotificationThroughChannels(notification) {
    try {
      // Get user with preferences
      const user = await User.findById(notification.recipient).select(
        "name email phoneNumber notificationPreferences pushSubscriptions"
      );

      if (!user) {
        console.log(
          "⚠️ User not found for notification:",
          notification.recipient
        );
        return;
      }

      const preferences = user.notificationPreferences || {};

      // Send email notification if enabled (or if user is admin for admin notifications)
      const isAdminNotification =
        notification.type.includes("new_") ||
        notification.type.includes("verification_") ||
        notification.type.includes("dispute_") ||
        notification.type.includes("system_") ||
        notification.type.includes("platform_") ||
        notification.type.includes("feature_") ||
        notification.type.includes("policy_");

      const shouldSendEmail =
        (preferences.email &&
          this.shouldSendEmailNotification(notification.type)) ||
        (user.role === "admin" && isAdminNotification);

      if (shouldSendEmail) {
        await this.sendEmailNotification(notification, user);
      }

      // Send SMS notification if enabled
      if (
        preferences.sms &&
        user.phoneNumber &&
        this.shouldSendSMSNotification(notification.type)
      ) {
        await this.sendSMSNotification(notification, user);
      }

      // Send push notification if enabled
      if (
        preferences.push &&
        this.shouldSendPushNotification(notification.type)
      ) {
        await this.sendPushNotification(notification, user);
      }
    } catch (error) {
      console.error("❌ Error sending notification through channels:", error);
      // Don't fail the notification creation if channel sending fails
    }
  }

  /**
   * Check if email notification should be sent for this type
   */
  static shouldSendEmailNotification(type) {
    // Always send important notifications via email
    const importantTypes = [
      "verification_approved",
      "verification_rejected",
      "bid_accepted",
      "shipment_delivered",
      "payment_failed",
      "dispute_created",
      // Tracking status change notifications - always send via email
      "tracking_started",
      "tracking_stopped",
      "tracking_location_update",
      "tracking_milestone_reached",
      // Admin notification types - always send via email
      "new_user_registered",
      "new_logistics_registered",
      "verification_requested",
      "dispute_escalated",
      "payment_issue",
      "high_volume_activity",
      "suspicious_activity",
      "system_alert",
      "platform_maintenance",
      "feature_update",
      "policy_update",
    ];

    return importantTypes.includes(type) || true; // Default to true for now
  }

  /**
   * Check if SMS notification should be sent for this type
   */
  static shouldSendSMSNotification(type) {
    // Only send urgent notifications via SMS
    const urgentTypes = [
      "verification_approved",
      "bid_accepted",
      "shipment_delivered",
      "payment_failed",
      "dispute_created",
    ];

    return urgentTypes.includes(type);
  }

  /**
   * Check if push notification should be sent for this type
   */
  static shouldSendPushNotification(type) {
    // Send most notifications via push
    const excludedTypes = ["marketing", "updates"];

    return !excludedTypes.includes(type);
  }

  /**
   * Send in-app notification via Socket.io
   */
  static async sendInAppNotification(notification) {
    const io = require("../socket/index").getIO();
    if (io) {
      const roomName = `user-${notification.recipient}`;
      const notificationPayload = {
        _id: notification._id,
        id: notification._id, // For compatibility
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        status: notification.status,
        createdAt: notification.createdAt,
        relatedEntity: notification.relatedEntity,
        metadata: notification.metadata,
        actions: notification.actions,
      };

      console.log(`📡 Emitting in-app notification to room: ${roomName}`);

      // Emit to specific user room
      io.to(roomName).emit("new-notification", notificationPayload);

      // Also emit to admin rooms if it's a system notification
      if (
        notification.type.includes("system") ||
        notification.type.includes("admin")
      ) {
        io.to("admin-room").emit("new-notification", notificationPayload);
      }

      console.log(
        `✅ In-app notification emitted successfully to room: ${roomName}`
      );
    } else {
      console.log("⚠️ Socket.io not available for in-app notification");
    }
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(notification, user) {
    try {
      const { sendNotificationEmail } = require("../utils/emailService");

      const emailResult = await sendNotificationEmail(
        user.email,
        user.name || "User",
        notification
      );

      if (emailResult.success) {
        console.log("✅ Email notification sent successfully to:", user.email);
      } else {
        console.error(
          "❌ Failed to send email notification:",
          emailResult.error
        );
      }
    } catch (error) {
      console.error("❌ Error sending email notification:", error);
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMSNotification(notification, user) {
    try {
      if (!user.phoneNumber) {
        console.log("⚠️ No phone number available for SMS notification");
        return;
      }

      const smsResult = await smsService.sendNotificationSMS(
        user.phoneNumber,
        notification
      );

      if (smsResult.success) {
        console.log(
          "✅ SMS notification sent successfully to:",
          user.phoneNumber
        );
      } else {
        console.error("❌ Failed to send SMS notification:", smsResult.error);
      }
    } catch (error) {
      console.error("❌ Error sending SMS notification:", error);
    }
  }

  /**
   * Send push notification
   */
  static async sendPushNotification(notification, user) {
    try {
      const pushSubscriptions = user.pushSubscriptions || [];

      if (pushSubscriptions.length === 0) {
        console.log("⚠️ No push subscriptions available for push notification");
        return;
      }

      const results = await pushService.sendBulkPushNotifications(
        pushSubscriptions,
        notification
      );

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      console.log(
        `✅ Push notifications sent: ${successCount} successful, ${failureCount} failed`
      );

      // Remove expired subscriptions
      const expiredSubscriptions = results
        .filter((r) => !r.success && r.error === "Subscription expired")
        .map((r) => r.subscription);

      if (expiredSubscriptions.length > 0) {
        await this.removeExpiredPushSubscriptions(
          notification.recipient,
          expiredSubscriptions
        );
      }
    } catch (error) {
      console.error("❌ Error sending push notification:", error);
    }
  }

  /**
   * Remove expired push subscriptions
   */
  static async removeExpiredPushSubscriptions(userId, expiredSubscriptionIds) {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { _id: { $in: expiredSubscriptionIds } } },
      });
      console.log(
        `✅ Removed ${expiredSubscriptionIds.length} expired push subscriptions`
      );
    } catch (error) {
      console.error("❌ Error removing expired push subscriptions:", error);
    }
  }

  /**
   * Remove expired push notification tokens
   */
  static async removeExpiredPushTokens(userId, expiredTokens) {
    try {
      const preferences = await NotificationPreferences.getUserPreferences(
        userId
      );
      preferences.push.deviceTokens = preferences.push.deviceTokens.filter(
        (token) => !expiredTokens.includes(token.token)
      );
      await preferences.save();
      console.log("✅ Removed expired push tokens for user:", userId);
    } catch (error) {
      console.error("❌ Error removing expired push tokens:", error);
    }
  }

  /**
   * Create multiple notifications for multiple recipients
   */
  static async createBulkNotifications(notificationsData) {
    try {
      const notifications = await Notification.insertMany(notificationsData);

      // Emit real-time notifications (only if Socket.io is available)
      try {
        const io = require("../socket/index").getIO();
        if (io) {
          notifications.forEach((notification) => {
            io.to(`user-${notification.recipient}`).emit("new-notification", {
              id: notification._id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              priority: notification.priority,
              createdAt: notification.createdAt,
            });
          });
        }
      } catch (socketError) {
        console.log(
          "⚠️ Socket.io not available for real-time notifications:",
          socketError.message
        );
        // Continue without Socket.io - notifications are still created in database
      }

      return notifications;
    } catch (error) {
      console.error("Error creating bulk notifications:", error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId,
    page = 1,
    limit = 20,
    status = "all"
  ) {
    try {
      console.log(
        `🔍 Fetching notifications for user ${userId}, page ${page}, status: ${status}`
      );

      const query = { recipient: userId };
      if (status !== "all") {
        query.status = status;
      }

      console.log("🔍 Query:", query);

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("recipient", "name email role")
        .lean();

      const total = await Notification.countDocuments(query);

      console.log(
        `📋 Found ${notifications.length} notifications out of ${total} total for user ${userId}`
      );

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { status: "read", readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error("Notification not found or unauthorized");
      }

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, status: "unread" },
        { status: "read", readAt: new Date() }
      );

      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipient: userId,
        status: "unread",
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
      });

      if (!notification) {
        throw new Error("Notification not found or unauthorized");
      }

      return notification;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Archive notification
   */
  static async archiveNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { status: "archived", archivedAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error("Notification not found or unauthorized");
      }

      return notification;
    } catch (error) {
      console.error("Error archiving notification:", error);
      throw error;
    }
  }

  // ===== SPECIFIC NOTIFICATION CREATORS =====

  /**
   * Shipment-related notifications
   */
  static async notifyShipmentCreated(shipment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "shipment_created",
      title: "Shipment Created Successfully",
      message: `Your shipment "${shipment.shipmentTitle}" has been created and is now available for bidding.`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "medium",
      actions: [
        {
          label: "View Shipment",
          action: "view",
          url: `/shipments/${shipment._id}`,
        },
      ],
    });
  }

  static async notifyNewShipmentAvailable(shipment, logisticsUsers) {
    const notifications = logisticsUsers.map((logistics) => ({
      recipient: logistics._id,
      type: "new_shipment_available",
      title: "New Shipment Available",
      message: `A new shipment "${shipment.shipmentTitle}" is available for bidding.`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "high",
      actions: [
        {
          label: "View & Bid",
          action: "view",
          url: `/shipments/${shipment._id}`,
        },
      ],
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyBidReceived(shipment, bid, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "bid_received",
      title: "New Bid Received",
      message: `You received a new bid of $${bid.bidAmount} for your shipment "${shipment.shipmentTitle}".`,
      relatedEntity: { type: "bid", id: bid._id },
      priority: "high",
      actions: [
        {
          label: "View Bid",
          action: "view",
          url: `/shipments/${shipment._id}`,
        },
      ],
    });
  }

  static async notifyBidAccepted(bid, logisticsUser) {
    return await this.createNotification({
      recipient: logisticsUser._id,
      type: "bid_accepted",
      title: "Bid Accepted!",
      message: `Your bid of ${bid.currency} ${bid.price} has been accepted. The shipment is now assigned to you.`,
      relatedEntity: { type: "bid", id: bid._id },
      priority: "high",
      metadata: {
        bidId: bid._id,
        shipmentId: bid.shipment,
        price: bid.price,
        currency: bid.currency,
        eta: bid.eta,
      },
      actions: [
        {
          label: "View Shipment",
          action: "view",
          url: `/shipments/${bid.shipment}`,
        },
      ],
    });
  }

  static async notifyBidRejected(bid, logisticsUser) {
    return await this.createNotification({
      recipient: logisticsUser._id,
      type: "bid_rejected",
      title: "Bid Not Selected",
      message: `Your bid of ${bid.currency} ${bid.price} was not selected for this shipment.`,
      relatedEntity: { type: "bid", id: bid._id },
      priority: "low",
      metadata: {
        bidId: bid._id,
        shipmentId: bid.shipment,
        price: bid.price,
        currency: bid.currency,
        eta: bid.eta,
      },
    });
  }

  static async notifyShipmentDelivered(shipment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "shipment_delivered",
      title: "Shipment Delivered",
      message: `Your shipment "${shipment.shipmentTitle}" has been delivered. Please confirm receipt.`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "high",
      actions: [
        {
          label: "Confirm Receipt",
          action: "view",
          url: `/shipments/${shipment._id}`,
        },
      ],
    });
  }

  static async notifyShipmentDelivered(shipment, logisticsUser) {
    return await this.createNotification({
      recipient: logisticsUser._id,
      type: "shipment_delivered",
      title: "Delivery Confirmed",
      message: `The user has confirmed receipt of your delivery for "${shipment.shipmentTitle}".`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "medium",
      actions: [
        {
          label: "View Details",
          action: "view",
          url: `/shipments/${shipment._id}`,
        },
      ],
    });
  }

  /**
   * Payment-related notifications
   */
  static async notifyPaymentReceived(payment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "payment_received",
      title: "Payment Received",
      message: `Payment of $${payment.amount} has been successfully processed.`,
      relatedEntity: { type: "payment", id: payment._id },
      priority: "high",
    });
  }

  static async notifyPaymentFailed(payment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "payment_failed",
      title: "Payment Failed",
      message: `Payment of $${payment.amount} failed. Please try again or contact support.`,
      relatedEntity: { type: "payment", id: payment._id },
      priority: "urgent",
      actions: [
        {
          label: "Retry Payment",
          action: "view",
          url: `/payments/${payment._id}`,
        },
      ],
    });
  }

  /**
   * Dispute-related notifications
   */
  static async notifyDisputeCreated(dispute, adminUsers) {
    const notifications = adminUsers.map((admin) => ({
      recipient: admin._id,
      type: "dispute_created",
      title: "New Dispute Created",
      message: `A new dispute has been created regarding shipment "${
        dispute.shipment?.reference || "Unknown"
      }".`,
      relatedEntity: { type: "dispute", id: dispute._id },
      priority: "high",
      actions: [
        {
          label: "Review Dispute",
          action: "view",
          url: `/admin/disputes/${dispute._id}`,
        },
      ],
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyDisputeResolved(dispute, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `Your dispute regarding "${
        dispute.shipment?.reference || "shipment"
      }" has been resolved.`,
      relatedEntity: { type: "dispute", id: dispute._id },
      priority: "medium",
      actions: [
        {
          label: "View Resolution",
          action: "view",
          url: `/disputes/${dispute._id}`,
        },
      ],
    });
  }

  /**
   * Verification-related notifications
   */
  static async notifyVerificationApproved(user) {
    return await this.createNotification({
      recipient: user._id,
      type: "verification_approved",
      title: "Verification Approved",
      message: `Your ${user.role} account has been verified and approved.`,
      priority: "high",
      actions: [{ label: "View Profile", action: "view", url: `/profile` }],
    });
  }

  static async notifyVerificationRejected(user, reason) {
    return await this.createNotification({
      recipient: user._id,
      type: "verification_rejected",
      title: "Verification Rejected",
      message: `Your verification was rejected. Reason: ${reason}`,
      priority: "high",
      actions: [{ label: "Reapply", action: "view", url: `/verification` }],
    });
  }

  /**
   * Admin notifications
   */
  static async notifyNewUserRegistration(user, adminUsers) {
    const notifications = adminUsers.map((admin) => ({
      recipient: admin._id,
      type: "new_user_registered",
      title: "New User Registration",
      message: `A new ${user.role} user "${user.name}" has registered.`,
      relatedEntity: { type: "user", id: user._id },
      priority: "medium",
      actions: [
        { label: "View User", action: "view", url: `/admin/users/${user._id}` },
      ],
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyNewLogisticsRegistration(user, adminUsers) {
    const notifications = adminUsers.map((admin) => ({
      recipient: admin._id,
      type: "new_logistics_registered",
      title: "New Logistics Registration",
      message: `A new logistics company "${user.companyName}" has registered and requires verification.`,
      relatedEntity: { type: "user", id: user._id },
      priority: "high",
      actions: [
        {
          label: "Review Application",
          action: "view",
          url: `/admin/logistics/${user._id}`,
        },
      ],
    }));

    return await this.createBulkNotifications(notifications);
  }

  /**
   * System notifications
   */
  static async notifySystemAlert(message, allUsers, priority = "medium") {
    const notifications = allUsers.map((user) => ({
      recipient: user._id,
      type: "system_alert",
      title: "System Alert",
      message: message,
      priority: priority,
      metadata: { system: true },
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyPlatformMaintenance(startTime, endTime, allUsers) {
    const notifications = allUsers.map((user) => ({
      recipient: user._id,
      type: "platform_maintenance",
      title: "Scheduled Maintenance",
      message: `Platform maintenance is scheduled from ${startTime} to ${endTime}. Some features may be unavailable.`,
      priority: "medium",
      metadata: {
        maintenance: true,
        startTime,
        endTime,
      },
    }));

    return await this.createBulkNotifications(notifications);
  }

  /**
   * Tracking-related notifications
   */
  static async notifyTrackingStarted(shipment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "tracking_started",
      title: "Shipment Tracking Started",
      message: `Real-time tracking has started for your shipment "${shipment.shipmentTitle}". You can now monitor its progress in real-time.`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "high",
      metadata: {
        shipmentId: shipment._id,
        shipmentTitle: shipment.shipmentTitle,
        trackingStartedAt: shipment.trackingStartedAt,
        trackingNumber: shipment.trackingNumber,
      },
      actions: [
        {
          label: "Track Shipment",
          action: "view",
          url: `/shipments/${shipment._id}/tracking`,
        },
      ],
    });
  }

  static async notifyTrackingStopped(shipment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: "tracking_stopped",
      title: "Shipment Tracking Stopped",
      message: `Real-time tracking has stopped for your shipment "${shipment.shipmentTitle}". The shipment may have reached its destination or tracking was paused by the logistics company.`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "medium",
      metadata: {
        shipmentId: shipment._id,
        shipmentTitle: shipment.shipmentTitle,
        trackingStoppedAt: shipment.trackingEndedAt,
        trackingNumber: shipment.trackingNumber,
      },
      actions: [
        {
          label: "View Shipment",
          action: "view",
          url: `/shipments/${shipment._id}`,
        },
      ],
    });
  }

  static async notifyTrackingLocationUpdate(shipment, user, locationData) {
    return await this.createNotification({
      recipient: user._id,
      type: "tracking_location_update",
      title: "Shipment Location Update",
      message: `Your shipment "${
        shipment.shipmentTitle
      }" has been updated with a new location: ${
        locationData.address || `${locationData.lat}, ${locationData.lng}`
      }.`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "low",
      metadata: {
        shipmentId: shipment._id,
        shipmentTitle: shipment.shipmentTitle,
        location: locationData,
        trackingNumber: shipment.trackingNumber,
        updateTime: new Date(),
      },
      actions: [
        {
          label: "View on Map",
          action: "view",
          url: `/shipments/${shipment._id}/tracking`,
        },
      ],
    });
  }

  static async notifyTrackingMilestoneReached(shipment, user, milestone) {
    return await this.createNotification({
      recipient: user._id,
      type: "tracking_milestone_reached",
      title: "Shipment Milestone Reached",
      message: `Your shipment "${shipment.shipmentTitle}" has reached a milestone: ${milestone.description}.`,
      relatedEntity: { type: "shipment", id: shipment._id },
      priority: "medium",
      metadata: {
        shipmentId: shipment._id,
        shipmentTitle: shipment.shipmentTitle,
        milestone: milestone,
        trackingNumber: shipment.trackingNumber,
        reachedAt: new Date(),
      },
      actions: [
        {
          label: "View Progress",
          action: "view",
          url: `/shipments/${shipment._id}/tracking`,
        },
      ],
    });
  }
}

module.exports = NotificationService;
