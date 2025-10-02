const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const {
  upload,
  uploadProfilePicture: uploadProfilePictureToCloudinary,
} = require("../middlewares/cloudinaryUploadMiddleware");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      contactPhone, // Add contactPhone for logistics users
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
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
      registrationNumber,
    };

    // Add contactPhone for logistics users
    if (contactPhone) {
      updateData.contactPhone = contactPhone;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    console.log("🔐 Password change request received:", {
      userId: req.user?._id,
      hasCurrentPassword: !!req.body.currentPassword,
      hasNewPassword: !!req.body.newPassword,
      currentPasswordLength: req.body.currentPassword?.length,
      newPasswordLength: req.body.newPassword?.length,
    });

    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      console.log("❌ Missing required fields:", {
        currentPassword: !!currentPassword,
        newPassword: !!newPassword,
      });
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      console.log("❌ Password too short:", { length: newPassword.length });
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password (explicitly select password field)
    console.log("🔍 Looking up user:", userId);
    const user = await User.findById(userId).select("+password");
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User found:", {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      passwordType: typeof user.password,
      passwordLength: user.password?.length,
    });

    // Check if user has a password
    if (!user.password) {
      console.log("❌ User has no password set");
      return res.status(400).json({
        success: false,
        message: "No password set for this account. Please contact support.",
      });
    }

    // Verify current password
    console.log("🔍 Verifying current password...");
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    console.log("🔍 Password verification result:", isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      console.log("❌ Current password is incorrect");
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    console.log("🔐 Hashing new password...");
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log("✅ New password hashed successfully");

    // Update password
    console.log("💾 Updating user password...");
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });
    console.log("✅ Password updated successfully");

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    console.error("Error details:", {
      userId: req.user?._id,
      hasCurrentPassword: !!req.body.currentPassword,
      hasNewPassword: !!req.body.newPassword,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`🔍 Profile picture upload attempt for user: ${userId}`);

    // Validate file upload
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log(`📁 Uploaded file:`, {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferSize: req.file.buffer.length,
    });

    // Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      console.log("❌ Invalid file type:", req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxFileSize) {
      console.log(
        "❌ File too large:",
        req.file.size,
        "bytes (max:",
        maxFileSize,
        "bytes)"
      );
      return res.status(400).json({
        success: false,
        message: "Your file is too large. Please upload an image under 10MB.",
      });
    }

    // Get current user to check for existing profile picture
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old profile picture from Cloudinary if it exists
    if (user.profilePictureId) {
      try {
        console.log(
          `🗑️ Deleting old Cloudinary image with public_id: ${user.profilePictureId}`
        );
        await cloudinary.uploader.destroy(user.profilePictureId);
        console.log(`✅ Old Cloudinary image deleted successfully`);
      } catch (deleteError) {
        console.log(`⚠️ Could not delete old image: ${deleteError.message}`);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image to Cloudinary using memory buffer
    console.log(`☁️ Uploading to Cloudinary from memory buffer`);
    const cloudinaryResult = await uploadProfilePictureToCloudinary(
      req.file.buffer
    );

    console.log(`✅ Cloudinary upload successful:`, {
      public_id: cloudinaryResult.public_id,
      secure_url: cloudinaryResult.secure_url,
      format: cloudinaryResult.format,
      bytes: cloudinaryResult.bytes,
    });

    // Update user with new profile picture data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePictureUrl: cloudinaryResult.secure_url,
        profilePictureId: cloudinaryResult.public_id,
      },
      { new: true }
    ).select("-password");

    console.log(`✅ Profile picture uploaded successfully`);
    console.log(`🌐 Cloudinary URL: ${cloudinaryResult.secure_url}`);
    console.log(`🔍 Public ID: ${cloudinaryResult.public_id}`);

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    });
  } catch (error) {
    console.error("❌ Profile picture upload error:", error);

    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error: error.message,
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
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
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
      responseTime: "0 hours",
      successRate: 0,
    };

    if (userRole === "logistics") {
      // For logistics providers, get their shipment statistics
      const Shipment = require("../models/Shipment");
      const Bid = require("../models/Bid");

      // Get total bids they've placed
      const totalBids = await Bid.countDocuments({ carrier: userId });
      stats.totalShipments = totalBids;

      // Get accepted bids
      const completedBids = await Bid.countDocuments({
        carrier: userId,
        status: "accepted",
      });
      stats.completedShipments = completedBids;

      // Calculate success rate
      if (totalBids > 0) {
        stats.successRate = Math.round((completedBids / totalBids) * 100);
      }

      // Calculate actual average rating from rated shipments
      console.log(
        `🔍 DEBUG: Looking for rated shipments for logistics company: ${userId}`
      );

      // Convert userId to ObjectId if it's a string
      const mongoose = require("mongoose");
      const logisticsUserId = mongoose.isValidObjectId(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      // First, let's check if there are any shipments delivered by this logistics company
      const allDeliveredShipments = await Shipment.find({
        deliveredByLogistics: logisticsUserId,
      });
      console.log(
        `📦 Total shipments delivered by this logistics company: ${allDeliveredShipments.length}`
      );

      // Check if any of them have ratings
      const shipmentsWithRatings = await Shipment.find({
        deliveredByLogistics: logisticsUserId,
        rating: { $exists: true, $ne: null },
      });
      console.log(`⭐ Shipments with ratings: ${shipmentsWithRatings.length}`);

      // Also check if there are any shipments with ratings at all (for debugging)
      const allRatedShipments = await Shipment.find({
        rating: { $exists: true, $ne: null },
      });
      console.log(
        `🔍 DEBUG: Total shipments with ratings in database: ${allRatedShipments.length}`
      );

      if (allRatedShipments.length > 0) {
        console.log(
          "🔍 DEBUG: Sample rated shipments:",
          allRatedShipments.slice(0, 3).map((s) => ({
            id: s._id,
            rating: s.rating,
            status: s.status,
            deliveredByLogistics: s.deliveredByLogistics,
            deliveredByLogisticsType: typeof s.deliveredByLogistics,
          }))
        );
      }

      const ratedShipments = await Shipment.find({
        deliveredByLogistics: logisticsUserId,
        rating: { $exists: true, $ne: null },
      });

      if (ratedShipments.length > 0) {
        console.log(
          "🔍 DEBUG: Rated shipments found:",
          ratedShipments.map((s) => ({
            id: s._id,
            rating: s.rating,
            status: s.status,
            deliveredByLogistics: s.deliveredByLogistics,
          }))
        );

        const totalRating = ratedShipments.reduce(
          (sum, shipment) => sum + shipment.rating,
          0
        );
        stats.rating =
          Math.round((totalRating / ratedShipments.length) * 10) / 10; // Round to 1 decimal place
        console.log(
          `🔍 DEBUG: Calculated average rating: ${stats.rating} from ${ratedShipments.length} ratings`
        );
      } else {
        stats.rating = 0; // No ratings yet
        console.log("🔍 DEBUG: No ratings found, setting rating to 0");
      }

      // Calculate actual response time from bid data
      const recentBids = await Bid.find({
        carrier: userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      })
        .sort({ createdAt: -1 })
        .limit(10);

      if (recentBids.length > 0) {
        // Calculate average time between shipment creation and bid placement
        const responseTimes = [];
        for (const bid of recentBids) {
          const shipment = await Shipment.findById(bid.shipment);
          if (shipment) {
            const responseTimeMs = bid.createdAt - shipment.createdAt;
            const responseTimeHours = responseTimeMs / (1000 * 60 * 60);
            if (responseTimeHours >= 0 && responseTimeHours <= 168) {
              // Valid range: 0-168 hours (1 week)
              responseTimes.push(responseTimeHours);
            }
          }
        }

        if (responseTimes.length > 0) {
          const avgResponseTimeHours =
            responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length;
          if (avgResponseTimeHours < 1) {
            stats.responseTime = `${Math.round(
              avgResponseTimeHours * 60
            )} minutes`;
          } else if (avgResponseTimeHours < 24) {
            stats.responseTime = `${
              Math.round(avgResponseTimeHours * 10) / 10
            } hours`;
          } else {
            stats.responseTime = `${
              Math.round((avgResponseTimeHours / 24) * 10) / 10
            } days`;
          }
        } else {
          stats.responseTime = "2 hours"; // Default fallback
        }
      } else {
        stats.responseTime = "2 hours"; // Default fallback
      }
    } else if (userRole === "user") {
      // For regular users, get their shipment statistics
      const Shipment = require("../models/Shipment");

      // Get total shipments posted
      const totalShipments = await Shipment.countDocuments({ user: userId });
      stats.totalShipments = totalShipments;

      // Get completed shipments (status: 'completed' means user has confirmed delivery)
      const completedShipments = await Shipment.countDocuments({
        user: userId,
        status: "completed",
      });
      stats.completedShipments = completedShipments;

      // Calculate success rate
      if (totalShipments > 0) {
        stats.successRate = Math.round(
          (completedShipments / totalShipments) * 100
        );
      }

      // Mock rating (in real app, this would come from logistics provider ratings)
      stats.rating = 4.5;

      // Calculate actual response time for users (time to accept bids)
      const acceptedBids = await Bid.find({
        shipment: {
          $in: await Shipment.find({ user: userId }).distinct("_id"),
        },
        status: "accepted",
      })
        .sort({ updatedAt: -1 })
        .limit(10);

      if (acceptedBids.length > 0) {
        const responseTimes = [];
        for (const bid of acceptedBids) {
          if (bid.updatedAt && bid.createdAt) {
            const responseTimeMs = bid.updatedAt - bid.createdAt;
            const responseTimeHours = responseTimeMs / (1000 * 60 * 60);
            if (responseTimeHours >= 0 && responseTimeHours <= 168) {
              // Valid range: 0-168 hours
              responseTimes.push(responseTimeHours);
            }
          }
        }

        if (responseTimes.length > 0) {
          const avgResponseTimeHours =
            responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length;
          if (avgResponseTimeHours < 1) {
            stats.responseTime = `${Math.round(
              avgResponseTimeHours * 60
            )} minutes`;
          } else if (avgResponseTimeHours < 24) {
            stats.responseTime = `${
              Math.round(avgResponseTimeHours * 10) / 10
            } hours`;
          } else {
            stats.responseTime = `${
              Math.round((avgResponseTimeHours / 24) * 10) / 10
            } days`;
          }
        } else {
          stats.responseTime = "1 hour"; // Default fallback
        }
      } else {
        stats.responseTime = "1 hour"; // Default fallback
      }
    } else if (userRole === "user") {
      // For regular users, get their shipment statistics
      const Shipment = require("../models/Shipment");
      const Bid = require("../models/Bid");

      // Get total shipments they've posted
      const totalShipments = await Shipment.countDocuments({ user: userId });
      stats.totalShipments = totalShipments;

      // Get completed/delivered shipments
      const completedShipments = await Shipment.countDocuments({
        user: userId,
        status: "delivered",
      });
      stats.completedShipments = completedShipments;

      // Calculate completion rate
      if (totalShipments > 0) {
        stats.successRate = Math.round(
          (completedShipments / totalShipments) * 100
        );
      }

      // Get average rating they've given to logistics providers
      const ratedShipments = await Shipment.find({
        user: userId,
        rating: { $exists: true, $ne: null },
      });

      if (ratedShipments.length > 0) {
        const totalRating = ratedShipments.reduce(
          (sum, shipment) => sum + shipment.rating,
          0
        );
        stats.rating =
          Math.round((totalRating / ratedShipments.length) * 10) / 10;
      } else {
        stats.rating = 0;
      }

      // Calculate average response time from bids received
      const shipmentsWithBids = await Shipment.find({
        user: userId,
        $expr: { $gt: [{ $size: "$bids" }, 0] },
      }).populate("bids");

      if (shipmentsWithBids.length > 0) {
        const responseTimes = [];
        for (const shipment of shipmentsWithBids) {
          if (shipment.bids && shipment.bids.length > 0) {
            // Get the first bid (earliest response)
            const firstBid = shipment.bids.sort(
              (a, b) => a.createdAt - b.createdAt
            )[0];
            if (firstBid.createdAt && shipment.createdAt) {
              const responseTimeMs = firstBid.createdAt - shipment.createdAt;
              const responseTimeHours = responseTimeMs / (1000 * 60 * 60);
              if (responseTimeHours >= 0 && responseTimeHours <= 168) {
                responseTimes.push(responseTimeHours);
              }
            }
          }
        }

        if (responseTimes.length > 0) {
          const avgResponseTimeHours =
            responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length;
          if (avgResponseTimeHours < 1) {
            stats.responseTime = `${Math.round(
              avgResponseTimeHours * 60
            )} minutes`;
          } else if (avgResponseTimeHours < 24) {
            stats.responseTime = `${
              Math.round(avgResponseTimeHours * 10) / 10
            } hours`;
          } else {
            stats.responseTime = `${
              Math.round((avgResponseTimeHours / 24) * 10) / 10
            } days`;
          }
        } else {
          stats.responseTime = "1 hour"; // Default fallback
        }
      } else {
        stats.responseTime = "1 hour"; // Default fallback
      }
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile statistics",
      error: error.message,
    });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  uploadProfilePicture,
  uploadProfilePictureMiddleware: upload.single("profilePicture"),
  deleteAccount,
  getProfileStats,
};
