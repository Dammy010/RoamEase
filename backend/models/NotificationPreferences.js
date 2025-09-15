const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Email preferences
  email: {
    enabled: {
      type: Boolean,
      default: true
    },
    types: {
      shipment_created: { type: Boolean, default: true },
      shipment_updated: { type: Boolean, default: true },
      shipment_deleted: { type: Boolean, default: true },
      shipment_cancelled: { type: Boolean, default: true },
      shipment_status_updated: { type: Boolean, default: true },
      shipment_assigned: { type: Boolean, default: true },
      bid_received: { type: Boolean, default: true },
      bid_accepted: { type: Boolean, default: true },
      bid_rejected: { type: Boolean, default: true },
      shipment_delivered: { type: Boolean, default: true },
      payment_received: { type: Boolean, default: true },
      payment_failed: { type: Boolean, default: true },
      dispute_created: { type: Boolean, default: true },
      dispute_resolved: { type: Boolean, default: true },
      verification_approved: { type: Boolean, default: true },
      verification_rejected: { type: Boolean, default: true },
      new_message: { type: Boolean, default: true },
      system_alert: { type: Boolean, default: true },
      platform_maintenance: { type: Boolean, default: true }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    }
  },
  
  // SMS preferences
  sms: {
    enabled: {
      type: Boolean,
      default: false
    },
    phoneNumber: {
      type: String,
      default: null
    },
    types: {
      shipment_created: { type: Boolean, default: false },
      shipment_updated: { type: Boolean, default: false },
      shipment_deleted: { type: Boolean, default: false },
      shipment_cancelled: { type: Boolean, default: false },
      shipment_status_updated: { type: Boolean, default: false },
      shipment_assigned: { type: Boolean, default: false },
      bid_received: { type: Boolean, default: true },
      bid_accepted: { type: Boolean, default: true },
      bid_rejected: { type: Boolean, default: false },
      shipment_delivered: { type: Boolean, default: true },
      payment_received: { type: Boolean, default: true },
      payment_failed: { type: Boolean, default: true },
      dispute_created: { type: Boolean, default: true },
      dispute_resolved: { type: Boolean, default: false },
      verification_approved: { type: Boolean, default: true },
      verification_rejected: { type: Boolean, default: true },
      new_message: { type: Boolean, default: false },
      system_alert: { type: Boolean, default: true },
      platform_maintenance: { type: Boolean, default: false }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    }
  },
  
  // Push notification preferences
  push: {
    enabled: {
      type: Boolean,
      default: true
    },
    deviceTokens: [{
      token: String,
      platform: {
        type: String,
        enum: ['web', 'ios', 'android'],
        default: 'web'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    types: {
      shipment_created: { type: Boolean, default: true },
      shipment_updated: { type: Boolean, default: true },
      shipment_deleted: { type: Boolean, default: true },
      shipment_cancelled: { type: Boolean, default: true },
      shipment_status_updated: { type: Boolean, default: true },
      shipment_assigned: { type: Boolean, default: true },
      bid_received: { type: Boolean, default: true },
      bid_accepted: { type: Boolean, default: true },
      bid_rejected: { type: Boolean, default: true },
      shipment_delivered: { type: Boolean, default: true },
      payment_received: { type: Boolean, default: true },
      payment_failed: { type: Boolean, default: true },
      dispute_created: { type: Boolean, default: true },
      dispute_resolved: { type: Boolean, default: true },
      verification_approved: { type: Boolean, default: true },
      verification_rejected: { type: Boolean, default: true },
      new_message: { type: Boolean, default: true },
      system_alert: { type: Boolean, default: true },
      platform_maintenance: { type: Boolean, default: true }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    }
  },
  
  // In-app notification preferences
  inApp: {
    enabled: {
      type: Boolean,
      default: true
    },
    types: {
      shipment_created: { type: Boolean, default: true },
      shipment_updated: { type: Boolean, default: true },
      shipment_deleted: { type: Boolean, default: true },
      shipment_cancelled: { type: Boolean, default: true },
      shipment_status_updated: { type: Boolean, default: true },
      shipment_assigned: { type: Boolean, default: true },
      bid_received: { type: Boolean, default: true },
      bid_accepted: { type: Boolean, default: true },
      bid_rejected: { type: Boolean, default: true },
      shipment_delivered: { type: Boolean, default: true },
      payment_received: { type: Boolean, default: true },
      payment_failed: { type: Boolean, default: true },
      dispute_created: { type: Boolean, default: true },
      dispute_resolved: { type: Boolean, default: true },
      verification_approved: { type: Boolean, default: true },
      verification_rejected: { type: Boolean, default: true },
      new_message: { type: Boolean, default: true },
      system_alert: { type: Boolean, default: true },
      platform_maintenance: { type: Boolean, default: true }
    }
  },
  
  // Quiet hours (when notifications should be suppressed)
  quietHours: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String, // Format: "22:00"
      default: "22:00"
    },
    endTime: {
      type: String, // Format: "08:00"
      default: "08:00"
    },
    timezone: {
      type: String,
      default: "UTC"
    }
  },
  
  // Global settings
  digest: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily'
    },
    time: {
      type: String, // Format: "09:00"
      default: "09:00"
    }
  }
}, {
  timestamps: true
});

// Indexes
notificationPreferencesSchema.index({ user: 1 });

// Methods
notificationPreferencesSchema.methods.shouldSendNotification = function(type, channel) {
  const channelPrefs = this[channel];
  if (!channelPrefs || !channelPrefs.enabled) {
    return false;
  }
  
  // Check if this notification type is enabled for this channel
  return channelPrefs.types[type] === true;
};

notificationPreferencesSchema.methods.isQuietHours = function() {
  if (!this.quietHours.enabled) {
    return false;
  }
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format
  const startTime = this.quietHours.startTime;
  const endTime = this.quietHours.endTime;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    return currentTime >= startTime && currentTime <= endTime;
  }
};

// Static methods
notificationPreferencesSchema.statics.getUserPreferences = async function(userId) {
  let preferences = await this.findOne({ user: userId });
  
  if (!preferences) {
    // Create default preferences for new user
    preferences = new this({ user: userId });
    await preferences.save();
  }
  
  return preferences;
};

notificationPreferencesSchema.statics.updateUserPreferences = async function(userId, updates) {
  const preferences = await this.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    { new: true, upsert: true }
  );
  
  return preferences;
};

module.exports = mongoose.model('NotificationPreferences', notificationPreferencesSchema);
