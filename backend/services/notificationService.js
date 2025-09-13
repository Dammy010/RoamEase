const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(notificationData) {
    try {
      // Validate required fields
      if (!notificationData.recipient || !notificationData.type || !notificationData.title) {
        throw new Error('Missing required notification fields: recipient, type, title');
      }

      console.log('🔍 Creating notification with data:', {
        recipient: notificationData.recipient,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        metadata: notificationData.metadata
      });

      const notification = new Notification(notificationData);
      await notification.save();
      
      console.log(`✅ Notification created successfully:`, {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        recipient: notification.recipient,
        createdAt: notification.createdAt
      });
      
      // Emit real-time notification via Socket.io
      const io = require('../socket/index').getIO();
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
          actions: notification.actions
        };
        
        console.log(`📡 Emitting notification to room: ${roomName}`);
        console.log(`📋 Notification payload:`, notificationPayload);
        
        // Check if the room exists and has users
        const room = io.sockets.adapter.rooms.get(roomName);
        console.log(`👥 Users in room ${roomName}:`, room ? room.size : 0);
        console.log(`📡 Available rooms:`, Array.from(io.sockets.adapter.rooms.keys()));
        
        // Emit to specific user room
        console.log(`📤 Emitting notification to room: ${roomName}`);
        io.to(roomName).emit('new-notification', notificationPayload);
        
        // Also emit to admin rooms if it's a system notification
        if (notification.type.includes('system') || notification.type.includes('admin')) {
          io.to('admin-room').emit('new-notification', notificationPayload);
        }
        
        console.log(`✅ Notification emitted successfully to room: ${roomName}`);
      } else {
        console.log('⚠️ Socket.io not available for notification emission');
      }
      
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create multiple notifications for multiple recipients
   */
  static async createBulkNotifications(notificationsData) {
    try {
      const notifications = await Notification.insertMany(notificationsData);
      
      // Emit real-time notifications
      const io = require('../socket/index').getIO();
      if (io) {
        notifications.forEach(notification => {
          io.to(`user-${notification.recipient}`).emit('new-notification', {
            id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            createdAt: notification.createdAt
          });
        });
      }
      
      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(userId, page = 1, limit = 20, status = 'all') {
    try {
      console.log(`🔍 Fetching notifications for user ${userId}, page ${page}, status: ${status}`);
      
      const query = { recipient: userId };
      if (status !== 'all') {
        query.status = status;
      }

      console.log('🔍 Query:', query);

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('recipient', 'name email role')
        .lean();

      const total = await Notification.countDocuments(query);
      
      console.log(`📋 Found ${notifications.length} notifications out of ${total} total for user ${userId}`);
      
      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
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
        { status: 'read', readAt: new Date() },
        { new: true }
      );
      
      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }
      
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, status: 'unread' },
        { status: 'read', readAt: new Date() }
      );
      
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
        status: 'unread' 
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
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
        recipient: userId
      });
      
      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }
      
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
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
        { status: 'archived', archivedAt: new Date() },
        { new: true }
      );
      
      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }
      
      return notification;
    } catch (error) {
      console.error('Error archiving notification:', error);
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
      type: 'shipment_created',
      title: 'Shipment Created Successfully',
      message: `Your shipment "${shipment.shipmentTitle}" has been created and is now available for bidding.`,
      relatedEntity: { type: 'shipment', id: shipment._id },
      priority: 'medium',
      actions: [
        { label: 'View Shipment', action: 'view', url: `/shipments/${shipment._id}` }
      ]
    });
  }

  static async notifyNewShipmentAvailable(shipment, logisticsUsers) {
    const notifications = logisticsUsers.map(logistics => ({
      recipient: logistics._id,
      type: 'new_shipment_available',
      title: 'New Shipment Available',
      message: `A new shipment "${shipment.shipmentTitle}" is available for bidding.`,
      relatedEntity: { type: 'shipment', id: shipment._id },
      priority: 'high',
      actions: [
        { label: 'View & Bid', action: 'view', url: `/shipments/${shipment._id}` }
      ]
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyBidReceived(shipment, bid, user) {
    return await this.createNotification({
      recipient: user._id,
      type: 'bid_received',
      title: 'New Bid Received',
      message: `You received a new bid of $${bid.bidAmount} for your shipment "${shipment.shipmentTitle}".`,
      relatedEntity: { type: 'bid', id: bid._id },
      priority: 'high',
      actions: [
        { label: 'View Bid', action: 'view', url: `/shipments/${shipment._id}` }
      ]
    });
  }

  static async notifyBidAccepted(bid, logisticsUser) {
    return await this.createNotification({
      recipient: logisticsUser._id,
      type: 'bid_accepted',
      title: 'Bid Accepted!',
      message: `Your bid of ${bid.currency} ${bid.price} has been accepted. The shipment is now assigned to you.`,
      relatedEntity: { type: 'bid', id: bid._id },
      priority: 'high',
      metadata: {
        bidId: bid._id,
        shipmentId: bid.shipment,
        price: bid.price,
        currency: bid.currency,
        eta: bid.eta
      },
      actions: [
        { label: 'View Shipment', action: 'view', url: `/shipments/${bid.shipment}` }
      ]
    });
  }

  static async notifyBidRejected(bid, logisticsUser) {
    return await this.createNotification({
      recipient: logisticsUser._id,
      type: 'bid_rejected',
      title: 'Bid Not Selected',
      message: `Your bid of ${bid.currency} ${bid.price} was not selected for this shipment.`,
      relatedEntity: { type: 'bid', id: bid._id },
      priority: 'low',
      metadata: {
        bidId: bid._id,
        shipmentId: bid.shipment,
        price: bid.price,
        currency: bid.currency,
        eta: bid.eta
      }
    });
  }

  static async notifyShipmentDelivered(shipment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: 'shipment_delivered',
      title: 'Shipment Delivered',
      message: `Your shipment "${shipment.shipmentTitle}" has been delivered. Please confirm receipt.`,
      relatedEntity: { type: 'shipment', id: shipment._id },
      priority: 'high',
      actions: [
        { label: 'Confirm Receipt', action: 'view', url: `/shipments/${shipment._id}` }
      ]
    });
  }

  static async notifyShipmentDelivered(shipment, logisticsUser) {
    return await this.createNotification({
      recipient: logisticsUser._id,
      type: 'shipment_delivered',
      title: 'Delivery Confirmed',
      message: `The user has confirmed receipt of your delivery for "${shipment.shipmentTitle}".`,
      relatedEntity: { type: 'shipment', id: shipment._id },
      priority: 'medium',
      actions: [
        { label: 'View Details', action: 'view', url: `/shipments/${shipment._id}` }
      ]
    });
  }

  /**
   * Payment-related notifications
   */
  static async notifyPaymentReceived(payment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: 'payment_received',
      title: 'Payment Received',
      message: `Payment of $${payment.amount} has been successfully processed.`,
      relatedEntity: { type: 'payment', id: payment._id },
      priority: 'high'
    });
  }

  static async notifyPaymentFailed(payment, user) {
    return await this.createNotification({
      recipient: user._id,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Payment of $${payment.amount} failed. Please try again or contact support.`,
      relatedEntity: { type: 'payment', id: payment._id },
      priority: 'urgent',
      actions: [
        { label: 'Retry Payment', action: 'view', url: `/payments/${payment._id}` }
      ]
    });
  }

  /**
   * Dispute-related notifications
   */
  static async notifyDisputeCreated(dispute, adminUsers) {
    const notifications = adminUsers.map(admin => ({
      recipient: admin._id,
      type: 'dispute_created',
      title: 'New Dispute Created',
      message: `A new dispute has been created regarding shipment "${dispute.shipment?.reference || 'Unknown'}".`,
      relatedEntity: { type: 'dispute', id: dispute._id },
      priority: 'high',
      actions: [
        { label: 'Review Dispute', action: 'view', url: `/admin/disputes/${dispute._id}` }
      ]
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyDisputeResolved(dispute, user) {
    return await this.createNotification({
      recipient: user._id,
      type: 'dispute_resolved',
      title: 'Dispute Resolved',
      message: `Your dispute regarding "${dispute.shipment?.reference || 'shipment'}" has been resolved.`,
      relatedEntity: { type: 'dispute', id: dispute._id },
      priority: 'medium',
      actions: [
        { label: 'View Resolution', action: 'view', url: `/disputes/${dispute._id}` }
      ]
    });
  }

  /**
   * Verification-related notifications
   */
  static async notifyVerificationApproved(user) {
    return await this.createNotification({
      recipient: user._id,
      type: 'verification_approved',
      title: 'Verification Approved',
      message: `Your ${user.role} account has been verified and approved.`,
      priority: 'high',
      actions: [
        { label: 'View Profile', action: 'view', url: `/profile` }
      ]
    });
  }

  static async notifyVerificationRejected(user, reason) {
    return await this.createNotification({
      recipient: user._id,
      type: 'verification_rejected',
      title: 'Verification Rejected',
      message: `Your verification was rejected. Reason: ${reason}`,
      priority: 'high',
      actions: [
        { label: 'Reapply', action: 'view', url: `/verification` }
      ]
    });
  }

  /**
   * Admin notifications
   */
  static async notifyNewUserRegistration(user, adminUsers) {
    const notifications = adminUsers.map(admin => ({
      recipient: admin._id,
      type: 'new_user_registered',
      title: 'New User Registration',
      message: `A new ${user.role} user "${user.name}" has registered.`,
      relatedEntity: { type: 'user', id: user._id },
      priority: 'medium',
      actions: [
        { label: 'View User', action: 'view', url: `/admin/users/${user._id}` }
      ]
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyNewLogisticsRegistration(user, adminUsers) {
    const notifications = adminUsers.map(admin => ({
      recipient: admin._id,
      type: 'new_logistics_registered',
      title: 'New Logistics Registration',
      message: `A new logistics company "${user.companyName}" has registered and requires verification.`,
      relatedEntity: { type: 'user', id: user._id },
      priority: 'high',
      actions: [
        { label: 'Review Application', action: 'view', url: `/admin/logistics/${user._id}` }
      ]
    }));

    return await this.createBulkNotifications(notifications);
  }

  /**
   * System notifications
   */
  static async notifySystemAlert(message, allUsers, priority = 'medium') {
    const notifications = allUsers.map(user => ({
      recipient: user._id,
      type: 'system_alert',
      title: 'System Alert',
      message: message,
      priority: priority,
      metadata: { system: true }
    }));

    return await this.createBulkNotifications(notifications);
  }

  static async notifyPlatformMaintenance(startTime, endTime, allUsers) {
    const notifications = allUsers.map(user => ({
      recipient: user._id,
      type: 'platform_maintenance',
      title: 'Scheduled Maintenance',
      message: `Platform maintenance is scheduled from ${startTime} to ${endTime}. Some features may be unavailable.`,
      priority: 'medium',
      metadata: { 
        maintenance: true,
        startTime,
        endTime
      }
    }));

    return await this.createBulkNotifications(notifications);
  }
}

module.exports = NotificationService;
