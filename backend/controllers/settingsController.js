const User = require('../models/User');

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { theme, currency, language, timezone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        preferences: {
          theme: theme || 'light',
          currency: currency || 'USD',
          language: language || 'en',
          timezone: timezone || 'UTC'
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedUser.preferences
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// Update notification preferences
const updateNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, push, sms, marketing, security, updates } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        notificationPreferences: {
          email: email !== undefined ? email : true,
          push: push !== undefined ? push : true,
          sms: sms !== undefined ? sms : false,
          marketing: marketing !== undefined ? marketing : false,
          security: security !== undefined ? security : true,
          updates: updates !== undefined ? updates : true
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      notifications: updatedUser.notificationPreferences
    });
  } catch (error) {
    console.error('Notification preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences',
      error: error.message
    });
  }
};

// Update privacy settings
const updatePrivacy = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileVisibility, showEmail, showPhone, showLocation } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        privacySettings: {
          profileVisibility: profileVisibility || 'public',
          showEmail: showEmail !== undefined ? showEmail : true,
          showPhone: showPhone !== undefined ? showPhone : false,
          showLocation: showLocation !== undefined ? showLocation : true
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacy: updatedUser.privacySettings
    });
  } catch (error) {
    console.error('Privacy settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating privacy settings',
      error: error.message
    });
  }
};

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      settings: user.preferences || {
        theme: 'light',
        currency: 'USD',
        language: 'en',
        timezone: 'UTC'
      },
      notifications: user.notificationPreferences || {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        security: true,
        updates: true
      },
      privacy: user.privacySettings || {
        profileVisibility: 'public',
        showEmail: true,
        showPhone: false,
        showLocation: true
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

module.exports = {
  updateSettings,
  updateNotifications,
  updatePrivacy,
  getSettings
};
