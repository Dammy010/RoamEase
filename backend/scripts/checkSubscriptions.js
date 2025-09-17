const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
require('dotenv').config();

const checkSubscriptions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all subscriptions
    const subscriptions = await Subscription.find({}).populate('user', 'name email');
    
    console.log(`Found ${subscriptions.length} total subscriptions:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`\n${index + 1}. Subscription ID: ${sub._id}`);
      console.log(`   User: ${sub.user?.name} (${sub.user?.email})`);
      console.log(`   Plan: ${sub.plan}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Amount: ${sub.amount} ${sub.currency}`);
      console.log(`   Billing: ${sub.billingCycle}`);
      console.log(`   Created: ${sub.createdAt}`);
    });

  } catch (error) {
    console.error('Error checking subscriptions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the check
checkSubscriptions();
