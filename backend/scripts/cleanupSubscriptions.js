const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/roamease",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function cleanupAllPendingSubscriptions() {
  try {
    console.log("🧹 Starting cleanup of all pending subscriptions...");

    // Delete all pending subscriptions
    const result = await Subscription.deleteMany({
      status: "pending",
    });

    console.log(`✅ Cleaned up ${result.deletedCount} pending subscriptions`);

    // Also clean up any subscriptions older than 1 hour
    const oldResult = await Subscription.deleteMany({
      status: "pending",
      createdAt: { $lte: new Date(Date.now() - 60 * 60 * 1000) }, // Older than 1 hour
    });

    console.log(`✅ Cleaned up ${oldResult.deletedCount} old subscriptions`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

cleanupAllPendingSubscriptions();
