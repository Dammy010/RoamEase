const mongoose = require('mongoose');
const { sendNotificationEmail, sendVerificationEmail, sendSuspensionEmail } = require('../utils/emailService');
const NotificationService = require('../services/notificationService');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roamease');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test email configuration
const testEmailConfig = () => {
  console.log('🔍 Email Configuration Check:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✅ Set' : '❌ Missing');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
  console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Missing');
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n❌ Email configuration is incomplete!');
    console.log('Please set the following environment variables on Render:');
    console.log('- SMTP_HOST (e.g., smtp.gmail.com)');
    console.log('- SMTP_USER (your email address)');
    console.log('- SMTP_PASS (your email password or app password)');
    console.log('- SMTP_PORT (optional, defaults to 587)');
    return false;
  }
  
  console.log('\n✅ Email configuration looks good!');
  return true;
};

// Test basic email sending
const testBasicEmail = async () => {
  console.log('\n📧 Testing basic email sending...');
  
  const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;
  if (!testEmail) {
    console.log('❌ No test email address found. Set TEST_EMAIL environment variable.');
    return false;
  }
  
  try {
    const result = await sendNotificationEmail(testEmail, 'Test User', {
      title: 'Test Notification',
      message: 'This is a test email to verify email functionality.',
      type: 'test',
      priority: 'low',
      metadata: { test: true },
      actions: []
    });
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', result.messageId);
      return true;
    } else {
      console.log('❌ Test email failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Test email error:', error.message);
    return false;
  }
};

// Test notification service
const testNotificationService = async () => {
  console.log('\n🔔 Testing notification service...');
  
  try {
    // Find a test user
    const User = require('../models/User');
    const testUser = await User.findOne().select('_id name email');
    
    if (!testUser) {
      console.log('❌ No users found in database for testing');
      return false;
    }
    
    console.log(`📋 Testing with user: ${testUser.name} (${testUser.email})`);
    
    const notificationData = {
      recipient: testUser._id,
      type: 'test_notification',
      title: 'Test Notification',
      message: 'This is a test notification to verify the notification system.',
      priority: 'low',
      metadata: { test: true },
      actions: [
        {
          label: 'Test Action',
          action: 'test',
          url: '/test',
          method: 'GET',
        },
      ],
    };
    
    const notification = await NotificationService.createNotification(notificationData);
    console.log('✅ Test notification created successfully!');
    console.log('Notification ID:', notification._id);
    
    return true;
  } catch (error) {
    console.log('❌ Notification service test failed:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Email Notification Tests...\n');
  
  await connectDB();
  
  const configOk = testEmailConfig();
  if (!configOk) {
    console.log('\n❌ Email configuration test failed. Please fix configuration and try again.');
    process.exit(1);
  }
  
  const emailOk = await testBasicEmail();
  if (!emailOk) {
    console.log('\n❌ Basic email test failed. Please check SMTP settings.');
    process.exit(1);
  }
  
  const notificationOk = await testNotificationService();
  if (!notificationOk) {
    console.log('\n❌ Notification service test failed.');
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed! Email notifications should be working.');
  console.log('\n📋 Next steps:');
  console.log('1. Check your email inbox (and spam folder)');
  console.log('2. Create a test shipment to trigger notifications');
  console.log('3. Check the server logs for notification creation');
  
  process.exit(0);
};

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
