const mongoose = require("mongoose");
const Shipment = require("./models/Shipment");
const User = require("./models/User");
require("dotenv").config();

// Test shipment creation
const testShipmentCreation = async () => {
  try {
    console.log("🔍 Testing shipment creation...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find a test user
    const testUser = await User.findOne({ role: "user" });
    if (!testUser) {
      console.error("❌ No test user found. Please create a user first.");
      return;
    }
    console.log("✅ Found test user:", testUser.email);

    // Test shipment data
    const testShipmentData = {
      user: testUser._id,
      shipmentTitle: "Test Shipment",
      descriptionOfGoods: "Test goods description",
      typeOfGoods: "Electronics",
      weight: 10,
      length: 20,
      width: 15,
      height: 10,
      quantity: 1,
      pickupCity: "Lagos",
      pickupCountry: "Nigeria",
      deliveryCity: "Abuja",
      deliveryCountry: "Nigeria",
      modeOfTransport: "Road",
      insuranceRequired: "Yes",
      status: "open",
    };

    console.log("🔍 Creating test shipment...");
    const shipment = await Shipment.create(testShipmentData);
    console.log("✅ Test shipment created successfully:", shipment._id);

    // Clean up
    await Shipment.findByIdAndDelete(shipment._id);
    console.log("✅ Test shipment cleaned up");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      errors: error.errors,
    });
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
};

// Run the test
testShipmentCreation();
