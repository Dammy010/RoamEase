const mongoose = require("mongoose");
const User = require("../models/User");
const { sendReactivationEmail } = require("../utils/emailService");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/roamease"
    );
    console.log("MongoDB connected for suspension check");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Check and reactivate expired suspensions
const checkExpiredSuspensions = async () => {
  try {
    const now = new Date();

    // Find users with expired suspensions
    const expiredSuspensions = await User.find({
      isActive: false,
      suspensionEndDate: { $lte: now, $ne: null },
    });

    console.log(`Found ${expiredSuspensions.length} expired suspensions`);

    for (const user of expiredSuspensions) {
      try {
        // Reactivate user
        user.isActive = true;
        user.suspensionEndDate = null;
        user.suspensionReason = "";
        await user.save();

        console.log(`✅ Reactivated user: ${user.email}`);

        // Send reactivation email
        try {
          await sendReactivationEmail({
            to: user.email,
            data: {
              name: user.name || user.companyName || user.email,
            },
          });
          console.log(`📧 Reactivation email sent to: ${user.email}`);
        } catch (emailError) {
          console.error(
            `❌ Failed to send reactivation email to ${user.email}:`,
            emailError.message
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed to reactivate user ${user.email}:`,
          error.message
        );
      }
    }

    console.log("Suspension check completed");
  } catch (error) {
    console.error("Error checking suspensions:", error);
  }
};

// Run the check
const runSuspensionCheck = async () => {
  await connectDB();
  await checkExpiredSuspensions();
  await mongoose.connection.close();
  console.log("Database connection closed");
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runSuspensionCheck();
}

module.exports = { checkExpiredSuspensions };
