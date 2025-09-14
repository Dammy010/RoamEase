const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      email,
      phone,
      phoneNumber, // Also accept phoneNumber directly
      companyName,
      country,
      address,
      bio,
      website,
      yearsInOperation,
      companySize,
      registrationNumber,
      contactPhone // Add contactPhone for logistics users
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user profile
    const updateData = {
      name,
      email,
      phoneNumber: phoneNumber || phone, // Use phoneNumber if provided, otherwise use phone
      companyName,
      country,
      address,
      bio,
      website,
      yearsInOperation,
      companySize,
      registrationNumber
    };

    // Add contactPhone for logistics users
    if (contactPhone) {
      updateData.contactPhone = contactPhone;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
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
    const user = await User.findById(userId);
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
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Delete old profile picture if exists
    const user = await User.findById(userId);
    if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: req.file.filename },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: req.file.filename,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

// Get profile statistics
const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {
      totalShipments: 0,
      completedShipments: 0,
      rating: 0,
      responseTime: '0 hours',
      successRate: 0
    };

    if (userRole === 'logistics') {
      // For logistics providers, get their shipment statistics
      const Shipment = require('../models/Shipment');
      const Bid = require('../models/Bid');

      // Get total bids they've placed
      const totalBids = await Bid.countDocuments({ carrier: userId });
      stats.totalShipments = totalBids;

      // Get accepted bids
      const completedBids = await Bid.countDocuments({ 
        carrier: userId, 
        status: 'accepted' 
      });
      stats.completedShipments = completedBids;

      // Calculate success rate
      if (totalBids > 0) {
        stats.successRate = Math.round((completedBids / totalBids) * 100);
      }

      // Mock rating and response time (in real app, these would come from reviews)
      stats.rating = 4.8;
      stats.responseTime = '2 hours';
    } else if (userRole === 'user') {
      // For regular users, get their shipment statistics
      const Shipment = require('../models/Shipment');

      // Get total shipments posted
      const totalShipments = await Shipment.countDocuments({ user: userId });
      stats.totalShipments = totalShipments;

      // Get completed shipments (status: 'completed' means user has confirmed delivery)
      const completedShipments = await Shipment.countDocuments({ 
        user: userId, 
        status: 'completed' 
      });
      stats.completedShipments = completedShipments;

      // Calculate success rate
      if (totalShipments > 0) {
        stats.successRate = Math.round((completedShipments / totalShipments) * 100);
      }

      // Mock rating (in real app, this would come from logistics provider ratings)
      stats.rating = 4.5;
      stats.responseTime = '1 hour';
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile statistics',
      error: error.message
    });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  uploadProfilePicture,
  deleteAccount,
  getProfileStats
};
