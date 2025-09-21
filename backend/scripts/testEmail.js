const mongoose = require("mongoose");
const {
  sendSuspensionEmail,
  sendReactivationEmail,
} = require("../utils/emailService");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/roamease"
    );
    console.log("MongoDB connected for email test");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Test suspension email
const testSuspensionEmail = async () => {
  try {
    console.log("🧪 Testing suspension email...");

    const result = await sendSuspensionEmail({
      to: "test@example.com", // Replace with a real email for testing
      data: {
        name: "Test User",
        suspensionReason: "Testing email functionality",
        suspensionDuration: "7 days",
        suspensionEndDate: "January 20, 2025",
      },
    });

    console.log("✅ Suspension email test result:", result);
  } catch (error) {
    console.error("❌ Suspension email test failed:", error);
  }
};

// Test reactivation email
const testReactivationEmail = async () => {
  try {
    console.log("🧪 Testing reactivation email...");

    const result = await sendReactivationEmail({
      to: "test@example.com", // Replace with a real email for testing
      data: {
        name: "Test User",
      },
    });

    console.log("✅ Reactivation email test result:", result);
  } catch (error) {
    console.error("❌ Reactivation email test failed:", error);
  }
};

// Run the tests
const runEmailTests = async () => {
  await connectDB();

  console.log("📧 Starting email functionality tests...");
  console.log("⚠️  Make sure to set up your SMTP credentials in .env file");
  console.log(
    "⚠️  Replace test@example.com with a real email address for testing"
  );

  await testSuspensionEmail();
  await testReactivationEmail();

  await mongoose.connection.close();
  console.log("Database connection closed");
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runEmailTests();
}

module.exports = { testSuspensionEmail, testReactivationEmail };
