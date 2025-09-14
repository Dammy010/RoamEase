const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB using the same config as the main app
const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/roamease",
      options
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanupEmptyRegistrationNumbers = async () => {
  try {
    console.log('Starting cleanup of empty registration numbers...');
    
    // Find all users with empty registration numbers
    const usersWithEmptyRegNumbers = await User.find({
      registrationNumber: ''
    });
    
    console.log(`Found ${usersWithEmptyRegNumbers.length} users with empty registration numbers`);
    
    // Update them to set registrationNumber to undefined
    const result = await User.updateMany(
      { registrationNumber: '' },
      { $unset: { registrationNumber: 1 } }
    );
    
    console.log(`Updated ${result.modifiedCount} users`);
    console.log('Cleanup completed successfully');
    
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the cleanup
connectDB().then(() => {
  cleanupEmptyRegistrationNumbers();
});
