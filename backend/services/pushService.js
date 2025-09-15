const webpush = require('web-push');

class PushService {
  constructor() {
    // Initialize web-push if credentials are available
    this.isConfigured = false;
    
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_EMAIL) {
      try {
        webpush.setVapidDetails(
          process.env.VAPID_EMAIL,
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        this.isConfigured = true;
        console.log('✅ Push Service initialized with VAPID');
      } catch (error) {
        console.error('❌ Failed to initialize Push service:', error.message);
        this.isConfigured = false;
      }
    } else {
      console.log('⚠️ Push service not configured - missing VAPID credentials');
    }
  }

  /**
   * Send push notification to a specific subscription
   */
  async sendPushNotification(subscription, payload) {
    try {
      if (!this.isConfigured) {
        console.log('🔔 Push not configured, logging notification:', {
          endpoint: subscription.endpoint,
          payload: payload,
          timestamp: new Date().toISOString()
        });
        return {
          success: true,
          message: 'Push notification logged (service not configured)',
          id: `mock_${Date.now()}`
        };
      }

      console.log('🔔 Sending push notification:', {
        endpoint: subscription.endpoint,
        title: payload.title,
        timestamp: new Date().toISOString()
      });

      const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
      
      console.log('✅ Push notification sent successfully:', {
        statusCode: result.statusCode,
        headers: result.headers
      });

      return {
        success: true,
        message: 'Push notification sent successfully',
        statusCode: result.statusCode
      };
    } catch (error) {
      console.error('❌ Push notification failed:', error.message);
      
      // Handle specific error cases
      if (error.statusCode === 410) {
        return {
          success: false,
          error: 'Subscription expired',
          message: 'Push subscription is no longer valid',
          shouldRemove: true
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to send push notification'
      };
    }
  }

  /**
   * Send push notification for specific notification types
   */
  async sendNotificationPush(subscription, notification) {
    try {
      const payload = this.formatNotificationPayload(notification);
      return await this.sendPushNotification(subscription, payload);
    } catch (error) {
      console.error('❌ Notification push failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send notification push'
      };
    }
  }

  /**
   * Format notification for push payload
   */
  formatNotificationPayload(notification) {
    const { title, message, type, metadata, actions } = notification;
    
    const payload = {
      title: `RoamEase: ${title}`,
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification._id || `notification_${Date.now()}`,
      data: {
        notificationId: notification._id,
        type: type,
        url: this.getNotificationUrl(notification),
        metadata: metadata || {}
      },
      actions: this.formatActions(actions),
      requireInteraction: this.isHighPriority(notification),
      silent: false
    };

    return payload;
  }

  /**
   * Format action buttons for push notification
   */
  formatActions(actions) {
    if (!actions || actions.length === 0) {
      return [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon.ico'
        }
      ];
    }

    return actions.slice(0, 2).map(action => ({
      action: action.action || 'view',
      title: action.label || 'View',
      icon: '/favicon.ico'
    }));
  }

  /**
   * Get notification URL
   */
  getNotificationUrl(notification) {
    if (notification.actions && notification.actions.length > 0) {
      const action = notification.actions[0];
      if (action.url) {
        return `${process.env.FRONTEND_URL || 'https://roamease.com'}${action.url}`;
      }
    }
    
    // Default URLs based on notification type
    const typeUrls = {
      'shipment_created': '/user/dashboard',
      'bid_received': '/user/dashboard',
      'bid_accepted': '/logistics/dashboard',
      'shipment_delivered': '/user/dashboard',
      'verification_approved': '/logistics/dashboard',
      'new_shipment_available': '/logistics/dashboard'
    };
    
    const defaultUrl = typeUrls[notification.type] || '/notifications';
    return `${process.env.FRONTEND_URL || 'https://roamease.com'}${defaultUrl}`;
  }

  /**
   * Check if notification is high priority
   */
  isHighPriority(notification) {
    const highPriorityTypes = [
      'bid_received',
      'bid_accepted',
      'shipment_delivered',
      'verification_approved',
      'payment_failed',
      'dispute_created'
    ];
    
    return highPriorityTypes.includes(notification.type) || 
           notification.priority === 'high' || 
           notification.priority === 'urgent';
  }

  /**
   * Send bulk push notifications
   */
  async sendBulkPushNotifications(subscriptions, notification) {
    const results = [];
    
    for (const subscription of subscriptions) {
      try {
        const result = await this.sendNotificationPush(subscription, notification);
        results.push({
          subscription: subscription._id,
          success: result.success,
          error: result.error
        });
      } catch (error) {
        results.push({
          subscription: subscription._id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Check if push service is configured
   */
  isServiceConfigured() {
    return this.isConfigured;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      provider: 'Web Push (VAPID)',
      publicKey: process.env.VAPID_PUBLIC_KEY || 'Not configured'
    };
  }

  /**
   * Get VAPID public key for frontend
   */
  getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY || null;
  }
}

// Create singleton instance
const pushService = new PushService();

module.exports = pushService;