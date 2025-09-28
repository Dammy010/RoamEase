const emailService = require("../utils/emailService");

async function testEmailConfiguration() {
  console.log("🧪 Testing Email Configuration...");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log("SMTP_HOST:", process.env.SMTP_HOST ? "✅ Set" : "❌ Missing");
  console.log("SMTP_PORT:", process.env.SMTP_PORT || "587 (default)");
  console.log("SMTP_USER:", process.env.SMTP_USER ? "✅ Set" : "❌ Missing");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ Set" : "❌ Missing");
  console.log("CLIENT_URL:", process.env.CLIENT_URL || "❌ Missing");
  console.log("APP_NAME:", process.env.APP_NAME || "RoamEase (default)");

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.log(
      "❌ Email configuration incomplete. Please set SMTP variables."
    );
    return;
  }

  // Test verification email
  console.log("\n📧 Testing verification email...");
  const testEmail = "test@example.com"; // Replace with your test email
  const testCode = "123456";
  const testName = "Test User";

  try {
    const result = await emailService.sendVerificationEmail(
      testEmail,
      testCode,
      testName
    );
    if (result.success) {
      console.log("✅ Verification email test successful!");
      console.log("Message ID:", result.messageId);
    } else {
      console.log("❌ Verification email test failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Verification email test error:", error.message);
  }

  // Test notification email
  console.log("\n🔔 Testing notification email...");
  const testNotification = {
    title: "Test Notification",
    message: "This is a test notification to verify email functionality.",
    type: "test",
    priority: "medium",
  };

  try {
    const result = await emailService.sendNotificationEmail(
      testEmail,
      testName,
      testNotification
    );
    if (result.success) {
      console.log("✅ Notification email test successful!");
      console.log("Message ID:", result.messageId);
    } else {
      console.log("❌ Notification email test failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Notification email test error:", error.message);
  }

  console.log("\n📊 Email Analytics:");
  const analytics = emailService.getEmailAnalytics();
  console.log(analytics);
}

// Run the test
testEmailConfiguration().catch(console.error);
