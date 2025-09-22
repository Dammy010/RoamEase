const twilio = require("twilio");

class SMSService {
  constructor() {
    // Initialize Twilio client if credentials are available
    this.client = null;
    this.isConfigured = false;

    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      try {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.isConfigured = true;
        console.log("✅ SMS Service initialized with Twilio");
      } catch (error) {
        console.error("❌ Failed to initialize SMS service:", error.message);
        this.isConfigured = false;
      }
    } else {
      console.log("⚠️ SMS service not configured - missing Twilio credentials");
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber, message, options = {}) {
    try {
      if (!this.isConfigured) {
        console.log("📱 SMS not configured, logging message:", {
          to: phoneNumber,
          message: message,
          timestamp: new Date().toISOString(),
        });
        return {
          success: true,
          message: "SMS logged (service not configured)",
          sid: `mock_${Date.now()}`,
        };
      }

      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error("Invalid phone number format");
      }

      const smsOptions = {
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
        ...options,
      };

      console.log("📱 Sending SMS:", {
        to: phoneNumber,
        message: message.substring(0, 50) + "...",
        timestamp: new Date().toISOString(),
      });

      const result = await this.client.messages.create(smsOptions);

      console.log("✅ SMS sent successfully:", {
        sid: result.sid,
        to: phoneNumber,
        status: result.status,
      });

      return {
        success: true,
        message: "SMS sent successfully",
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error("❌ SMS sending failed:", error.message);
      return {
        success: false,
        error: error.message,
        message: "Failed to send SMS",
      };
    }
  }

  /**
   * Send notification SMS for specific types
   */
  async sendNotificationSMS(phoneNumber, notification) {
    try {
      const message = this.formatNotificationMessage(notification);
      return await this.sendSMS(phoneNumber, message);
    } catch (error) {
      console.error("❌ Notification SMS failed:", error.message);
      return {
        success: false,
        error: error.message,
        message: "Failed to send notification SMS",
      };
    }
  }

  /**
   * Format notification message for SMS
   */
  formatNotificationMessage(notification) {
    const { title, message, type, metadata } = notification;

    // Create concise SMS message
    let smsMessage = `RoamEase: ${title}`;

    if (message) {
      smsMessage += `\n\n${message}`;
    }

    // Add specific details based on notification type
    if (type === "bid_received" && metadata?.bidPrice) {
      smsMessage += `\nBid: $${metadata.bidPrice}`;
    } else if (type === "shipment_delivered" && metadata?.shipmentTitle) {
      smsMessage += `\nShipment: ${metadata.shipmentTitle}`;
    } else if (type === "verification_approved") {
      smsMessage += `\nYou can now bid on shipments!`;
    }

    // Add action URL if available
    if (notification.actions && notification.actions.length > 0) {
      const action = notification.actions[0];
      if (action.url) {
        smsMessage += `\n\nView: ${
          process.env.FRONTEND_URL || "https://roam-ease.vercel.app"
        }${action.url}`;
      }
    }

    return smsMessage;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic phone number validation (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");

    // Add country code if not present (assuming US +1)
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`;
    }

    return phoneNumber; // Return as-is if already formatted
  }

  /**
   * Check if SMS service is configured
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
      provider: "Twilio",
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || "Not configured",
    };
  }
}

// Create singleton instance
const smsService = new SMSService();

module.exports = smsService;
