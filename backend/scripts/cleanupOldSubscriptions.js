const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
require('dotenv').config();

const cleanupOldSubscriptions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all subscriptions with old pricing (less than 1000 NGN)
    const oldSubscriptions = await Subscription.find({
      amount: { $lt: 1000 }, // Old pricing was much lower
      currency: { $in: ['usd', 'USD'] } // Old currency
    });

    console.log(`Found ${oldSubscriptions.length} old subscriptions to clean up`);

    if (oldSubscriptions.length > 0) {
      // Option 1: Delete old subscriptions (recommended for testing)
      console.log('Deleting old subscriptions...');
      const deleteResult = await Subscription.deleteMany({
        amount: { $lt: 1000 },
        currency: { $in: ['usd', 'USD'] }
      });
      console.log(`Deleted ${deleteResult.deletedCount} old subscriptions`);

      // Also clean up related payments
      const paymentResult = await Payment.deleteMany({
        amount: { $lt: 100000 }, // Less than 1000 NGN in kobo
        currency: { $in: ['usd', 'USD'] }
      });
      console.log(`Deleted ${paymentResult.deletedCount} old payments`);

      console.log('✅ Cleanup completed successfully!');
      console.log('You can now create new subscriptions with the updated pricing.');
    } else {
      console.log('No old subscriptions found. Database is clean!');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanupOldSubscriptions();
