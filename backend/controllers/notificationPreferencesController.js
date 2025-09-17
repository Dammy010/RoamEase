 const NotificationPreferences = require('../models/NotificationPreferences');
const User = require('../models/User');

// Get user's notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const preferences = await NotificationPreferences.getUserPreferences(userId);
    
    res.json({
      success: true,
      preferences: preferences
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
};

// Update user's notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    // Validate the updates
    const allowedChannels = ['email', 'inApp', 'quietHours', 'digest'];
    const validUpdates = {};
    
    for (const channel of allowedChannels) {
      if (updates[channel] !== undefined) {
        validUpdates[channel] = updates[channel];
      }
    }
    
    const preferences = await NotificationPreferences.updateUserPreferences(userId, validUpdates);
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};


// Test notification preferences
const testNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { channel, type = 'test' } = req.body;
    
    if (!channel || !['email'].includes(channel)) {
      return res.status(400).json({
        success: false,
        message: 'Valid channel (email) is required'
      });
    }
    
    const preferences = await NotificationPreferences.getUserPreferences(userId);
    const user = await User.findById(userId).select('name email phoneNumber');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create test notification
    const testNotification = {
      _id: 'test_' + Date.now(),
      type: type,
      title: 'Test Notification',
      message: `This is a test ${channel} notification from RoamEase`,
      priority: 'medium',
      metadata: {
        test: true,
        channel: channel,
        timestamp: new Date().toISOString()
      }
    };
    
    let result = { success: false, message: 'Test failed' };
    
    // Send test notification based on channel
    switch (channel) {
      case 'email':
        if (preferences.shouldSendNotification(type, 'email')) {
          const { sendNotificationEmail } = require('../utils/emailService');
          result = await sendNotificationEmail(user.email, user.name, testNotification);
        } else {
          result = { success: false, message: 'Email notifications are disabled for this type' };
        }
        break;
    }
    
    res.json({
      success: result.success,
      message: result.message || result.error || 'Test completed',
      channel: channel,
      result: result
    });
  } catch (error) {
    console.error('Error testing notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test notification preferences',
      error: error.message
    });
  }
};

// Get notification preferences for admin
const getAdminNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const preferences = await NotificationPreferences.getUserPreferences(userId);
    const user = await User.findById(userId).select('name email phoneNumber role');
    
    res.json({
      success: true,
      preferences: preferences,
      user: user
    });
  } catch (error) {
    console.error('Error getting admin notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
};

module.exports = {
  getNotificationPreferences,
  updateNotificationPreferences,
  testNotificationPreferences,
  getAdminNotificationPreferences
};
