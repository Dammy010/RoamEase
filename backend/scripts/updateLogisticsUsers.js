const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roamease');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update existing logistics users to have name and phoneNumber
const updateLogisticsUsers = async () => {
  try {
    console.log('Starting update of logistics users...');
    
    // Find all logistics users without name or phoneNumber
    const logisticsUsers = await User.find({
      role: 'logistics',
      $or: [
        { name: { $in: [null, undefined, ''] } },
        { phoneNumber: { $in: [null, undefined, ''] } }
      ]
    });

    console.log(`Found ${logisticsUsers.length} logistics users to update`);

    for (const user of logisticsUsers) {
      const updateData = {};
      
      // Set default name if missing
      if (!user.name || user.name === '') {
        updateData.name = user.companyName || 'Logistics Provider';
        console.log(`Updating name for user ${user.email}: ${updateData.name}`);
      }
      
      // Set default phone number if missing
      if (!user.phoneNumber || user.phoneNumber === '') {
        updateData.phoneNumber = user.contactPhone || 'Not provided';
        console.log(`Updating phoneNumber for user ${user.email}: ${updateData.phoneNumber}`);
      }

      // Update the user if there are changes
      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(user._id, updateData);
        console.log(`Updated user ${user.email}`);
      }
    }

    console.log('Update completed successfully');
  } catch (error) {
    console.error('Error updating logistics users:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the update
connectDB().then(() => {
  updateLogisticsUsers();
});
