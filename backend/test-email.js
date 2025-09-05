const { sendVerificationEmail } = require('./utils/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configured***' : '❌ NOT SET');
  console.log('CLIENT_URL:', process.env.CLIENT_URL || '❌ NOT SET');
  console.log('APP_NAME:', process.env.APP_NAME || '❌ NOT SET');
  console.log('');

  // Check if all required variables are set
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n📝 Please create a .env file in the backend directory with:');
    console.log('SMTP_HOST=smtp.gmail.com');
    console.log('SMTP_PORT=587');
    console.log('SMTP_USER=your-email@gmail.com');
    console.log('SMTP_PASS=your-app-password');
    console.log('CLIENT_URL=http://localhost:5173');
    console.log('APP_NAME=RoamEase');
    return;
  }

  console.log('✅ All required environment variables are set!\n');

  // Test email sending
  console.log('📤 Sending test verification email...');
  
  try {
    const result = await sendVerificationEmail(
      'test@example.com', 
      'test-token-123456789', 
      'Test User'
    );
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\n🎉 Email configuration is working correctly!');
      console.log('You should now receive verification emails when users register.');
    } else {
      console.log('❌ Test email failed:');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Test email failed with error:');
    console.log('Error:', error.message);
    console.log('\n🔧 Common fixes:');
    console.log('1. Check your SMTP credentials');
    console.log('2. For Gmail: Enable 2FA and use App Password');
    console.log('3. Check firewall settings');
    console.log('4. Try a different email provider');
  }
}

// Run the test
testEmail().catch(console.error);
