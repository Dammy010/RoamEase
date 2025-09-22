const User = require("../models/User");
const NotificationService = require("../services/notificationService");

/**
 * Get user settings including notification preferences
 */
const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email phoneNumber notificationPreferences privacySettings preferences pushSubscriptions"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      settings: {
        profile: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        notifications: user.notificationPreferences || {},
        privacy: user.privacySettings || {},
        preferences: user.preferences || {},
        pushSubscriptions: user.pushSubscriptions || [],
      },
    });
  } catch (error) {
    console.error("Error getting user settings:", error);
    res
      .status(500)
      .json({ message: "Failed to get settings", error: error.message });
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const { email, push, sms, marketing, security, updates } = req.body;

    const updateData = {};
    if (email !== undefined)
      updateData["notificationPreferences.email"] = email;
    if (push !== undefined) updateData["notificationPreferences.push"] = push;
    if (sms !== undefined) updateData["notificationPreferences.sms"] = sms;
    if (marketing !== undefined)
      updateData["notificationPreferences.marketing"] = marketing;
    if (security !== undefined)
      updateData["notificationPreferences.security"] = security;
    if (updates !== undefined)
      updateData["notificationPreferences.updates"] = updates;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, select: "notificationPreferences" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res
      .status(500)
      .json({ message: "Failed to update preferences", error: error.message });
  }
};

/**
 * Update privacy settings
 */
const updatePrivacySettings = async (req, res) => {
  try {
    const { profileVisibility, showEmail, showPhone, showLocation } = req.body;

    const updateData = {};
    if (profileVisibility !== undefined)
      updateData["privacySettings.profileVisibility"] = profileVisibility;
    if (showEmail !== undefined)
      updateData["privacySettings.showEmail"] = showEmail;
    if (showPhone !== undefined)
      updateData["privacySettings.showPhone"] = showPhone;
    if (showLocation !== undefined)
      updateData["privacySettings.showLocation"] = showLocation;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, select: "privacySettings" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Privacy settings updated successfully",
      settings: user.privacySettings,
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    res
      .status(500)
      .json({
        message: "Failed to update privacy settings",
        error: error.message,
      });
  }
};

/**
 * Update general preferences
 */
const updateGeneralPreferences = async (req, res) => {
  try {
    const { theme, currency, language, timezone } = req.body;

    const updateData = {};
    if (theme !== undefined) updateData["preferences.theme"] = theme;
    if (currency !== undefined) updateData["preferences.currency"] = currency;
    if (language !== undefined) updateData["preferences.language"] = language;
    if (timezone !== undefined) updateData["preferences.timezone"] = timezone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, select: "preferences" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "General preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating general preferences:", error);
    res
      .status(500)
      .json({ message: "Failed to update preferences", error: error.message });
  }
};

/**
 * Test notification preferences
 */
const testNotificationPreferences = async (req, res) => {
  try {
    const { type, channel } = req.body;

    if (!type || !channel) {
      return res
        .status(400)
        .json({ message: "Notification type and channel are required" });
    }

    // Create a test notification
    const testNotification = {
      _id: `test_${Date.now()}`,
      type: type,
      title: "Test Notification",
      message:
        "This is a test notification to verify your preferences are working correctly.",
      priority: "medium",
      status: "unread",
      createdAt: new Date(),
      metadata: { test: true },
    };

    // Get user preferences
    const user = await User.findById(req.user._id).select(
      "name email phoneNumber notificationPreferences pushSubscriptions"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let result = { success: false, message: "Test notification not sent" };

    // Send test notification based on channel
    if (channel === "email" && user.notificationPreferences?.email) {
      result = await NotificationService.sendEmailNotification(
        testNotification,
        user
      );
    } else if (
      channel === "sms" &&
      user.notificationPreferences?.sms &&
      user.phoneNumber
    ) {
      result = await NotificationService.sendSMSNotification(
        testNotification,
        user
      );
    } else if (channel === "push" && user.notificationPreferences?.push) {
      result = await NotificationService.sendPushNotification(
        testNotification,
        user
      );
    } else {
      return res.status(400).json({
        message: `Cannot send test ${channel} notification. Please check your preferences and ensure you have the required information.`,
      });
    }

    res.json({
      success: result.success,
      message: result.success
        ? `Test ${channel} notification sent successfully`
        : `Failed to send test ${channel} notification: ${
            result.error || result.message
          }`,
      details: result,
    });
  } catch (error) {
    console.error("Error testing notification preferences:", error);
    res
      .status(500)
      .json({
        message: "Failed to test notification preferences",
        error: error.message,
      });
  }
};

module.exports = {
  getUserSettings,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateGeneralPreferences,
  testNotificationPreferences,
};
