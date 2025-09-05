const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
    };

    // Use .env MONGO_URI (fallback to localhost if not set)
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/roamease",
      options
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    connectDB.hasLoggedError = false;
  } catch (error) {
    if (!connectDB.hasLoggedError) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log("💡 To fix this:");
      console.log("   1. Install MongoDB locally OR use MongoDB Atlas");
      console.log("   2. Ensure .env has MONGO_URI set correctly");
      console.log("   3. Make sure MongoDB service/Atlas cluster is running");
      connectDB.hasLoggedError = true;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("🔄 Retrying MongoDB connection in 10 seconds (development mode)...");
      setTimeout(connectDB, 10000);
    } else {
      console.error("❌ MongoDB connection failed in production. Exiting...");
      process.exit(1);
    }
  }
};

// Events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connection established");
});
mongoose.connection.on("error", (err) => {
  console.error(`❌ Mongoose connection error: ${err}`);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("👋 Mongoose connection closed due to app termination");
  process.exit(0);
});

module.exports = connectDB;
