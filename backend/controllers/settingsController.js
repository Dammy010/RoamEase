const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone, companyName, country, address, bio } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    // Prepare update data based on user role
    const updateData = {};
    
    if (req.user.role === 'logistics') {
      if (companyName) updateData.companyName = companyName;
      if (phone) updateData.contactPhone = phone;
    } else {
      if (name) updateData.name = name;
      if (phone) updateData.phoneNumber = phone;
    }
    
    if (email) updateData.email = email;
    if (country) updateData.country = country;
    if (address) updateData.address = address;
    if (bio) updateData.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
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
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('🚀 Backend: Profile picture upload started');
    console.log('🚀 Backend: User ID:', req.user._id);
    console.log('🚀 Backend: Request file:', req.file);
    console.log('🚀 Backend: Request body:', req.body);
    
    const userId = req.user._id;
    
    if (!req.file) {
      console.error('❌ Backend: No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('✅ Backend: File received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    console.log('📁 Backend: Profile picture path:', profilePicturePath);
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicturePath },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.error('❌ Backend: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Backend: User updated successfully:', {
      id: updatedUser._id,
      profilePicture: updatedUser.profilePicture
    });

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    console.error('💥 Backend: Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

// Remove profile picture
const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: '' },
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
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing profile picture',
      error: error.message
    });
  }
};

module.exports = {
  updateSettings,
  updateNotifications,
  updatePrivacy,
  getSettings,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  removeProfilePicture
};
