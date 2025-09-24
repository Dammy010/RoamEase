const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/roamease');

const migratePhotos = async () => {
  try {
    console.log('🔄 Starting photo migration...');
    
    // Find all shipments with local photo paths
    const shipments = await Shipment.find({
      photos: { $exists: true, $ne: [] }
    });
    
    console.log(`📦 Found ${shipments.length} shipments with photos`);
    
    let migratedCount = 0;
    
    for (const shipment of shipments) {
      let hasLocalPhotos = false;
      const updatedPhotos = [];
      
      for (const photo of shipment.photos) {
        // Check if it's a local path (starts with 'uploads')
        if (photo.startsWith('uploads')) {
          hasLocalPhotos = true;
          // For now, we'll keep the local path but add a note
          // In production, you'd upload these to Cloudinary
          updatedPhotos.push(photo + ' (needs-migration)');
        } else {
          updatedPhotos.push(photo);
        }
      }
      
      if (hasLocalPhotos) {
        await Shipment.findByIdAndUpdate(shipment._id, {
          photos: updatedPhotos
        });
        migratedCount++;
        console.log(`✅ Updated shipment ${shipment._id}`);
      }
    }
    
    console.log(`🎉 Migration complete! Updated ${migratedCount} shipments`);
    
    // Also check users for profile pictures
    const users = await User.find({
      profilePicture: { $exists: true, $ne: null }
    });
    
    console.log(`👤 Found ${users.length} users with profile pictures`);
    
    let migratedUsers = 0;
    
    for (const user of users) {
      if (user.profilePicture.startsWith('uploads')) {
        await User.findByIdAndUpdate(user._id, {
          profilePicture: user.profilePicture + ' (needs-migration)'
        });
        migratedUsers++;
        console.log(`✅ Updated user ${user._id}`);
      }
    }
    
    console.log(`🎉 User migration complete! Updated ${migratedUsers} users`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    mongoose.disconnect();
  }
};

migratePhotos();
