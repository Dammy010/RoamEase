// Script to check and fix user profile picture data
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function checkAndFixUserProfilePictures() {
  try {
    console.log("🔍 Checking user profile picture data...");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/roamease"
    );
    console.log("✅ Connected to MongoDB");

    // Find the specific user
    const user = await User.findOne({ email: "da9783790@gmail.com" });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("👤 User found:", user.email);
    console.log("📊 Current profile picture data:");
    console.log("  profilePicture:", user.profilePicture);
    console.log("  profilePictureUrl:", user.profilePictureUrl);
    console.log("  profilePictureId:", user.profilePictureId);

    // Check if profilePictureUrl is missing but profilePicture exists
    if (user.profilePicture && !user.profilePictureUrl) {
      console.log("🔧 Fixing missing profilePictureUrl...");

      if (user.profilePicture.includes("res.cloudinary.com")) {
        // Extract public ID from Cloudinary URL
        const urlParts = user.profilePicture.split("/");
        const publicId = urlParts.slice(7).join("/").split(".")[0];

        await User.findByIdAndUpdate(user._id, {
          profilePictureUrl: user.profilePicture,
          profilePictureId: publicId,
        });

        console.log("✅ Updated with Cloudinary URL:", user.profilePicture);
        console.log("✅ Public ID:", publicId);
      } else {
        // For local files, set empty new fields
        await User.findByIdAndUpdate(user._id, {
          profilePictureUrl: "",
          profilePictureId: "",
        });

        console.log("✅ Updated with local file:", user.profilePicture);
      }
    } else if (!user.profilePictureUrl && !user.profilePicture) {
      console.log("⚠️ No profile picture data found");
    } else {
      console.log("✅ Profile picture data looks correct");
    }

    // Verify the fix
    const updatedUser = await User.findById(user._id);
    console.log("\n📊 Updated profile picture data:");
    console.log("  profilePicture:", updatedUser.profilePicture);
    console.log("  profilePictureUrl:", updatedUser.profilePictureUrl);
    console.log("  profilePictureId:", updatedUser.profilePictureId);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the check
checkAndFixUserProfilePictures();
