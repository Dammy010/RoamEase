// Test script to check what the backend login actually returns
const axios = require("axios");

async function testLoginResponse() {
  try {
    console.log("🧪 Testing backend login response...");

    // Test login endpoint
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email: "da9783790@gmail.com",
      password: "yourpassword", // You'll need to provide the actual password
    });

    console.log("✅ Login successful!");
    console.log("📋 Response data:", JSON.stringify(response.data, null, 2));

    // Check profile picture fields specifically
    console.log("\n🔍 Profile Picture Fields:");
    console.log("profilePicture:", response.data.profilePicture);
    console.log("profilePictureUrl:", response.data.profilePictureUrl);
    console.log("profilePictureId:", response.data.profilePictureId);

    // Test profile endpoint
    console.log("\n🧪 Testing profile endpoint...");
    const profileResponse = await axios.get(
      "http://localhost:5000/api/auth/profile",
      {
        headers: {
          Authorization: `Bearer ${response.data.accessToken}`,
        },
      }
    );

    console.log("✅ Profile fetch successful!");
    console.log(
      "📋 Profile data:",
      JSON.stringify(profileResponse.data, null, 2)
    );

    // Check profile picture fields in profile response
    console.log("\n🔍 Profile Picture Fields in Profile Response:");
    console.log("profilePicture:", profileResponse.data.user?.profilePicture);
    console.log(
      "profilePictureUrl:",
      profileResponse.data.user?.profilePictureUrl
    );
    console.log(
      "profilePictureId:",
      profileResponse.data.user?.profilePictureId
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testLoginResponse();
