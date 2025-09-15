const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email analytics and logging
const emailAnalytics = {
  sent: 0,
  failed: 0,
  lastSent: null,
  errors: []
};

// Log email activity
const logEmailActivity = (type, email, success, error = null) => {
  const timestamp = new Date().toISOString();
  
  if (success) {
    emailAnalytics.sent++;
    emailAnalytics.lastSent = timestamp;
    console.log(`✅ Email ${type} sent successfully to ${email} at ${timestamp}`);
  } else {
    emailAnalytics.failed++;
    emailAnalytics.errors.push({
      timestamp,
      type,
      email,
      error: error?.message || error
    });
    console.error(`❌ Email ${type} failed to ${email} at ${timestamp}:`, error?.message || error);
  }
};

// Get email analytics
const getEmailAnalytics = () => {
  return {
    ...emailAnalytics,
    successRate: emailAnalytics.sent + emailAnalytics.failed > 0 
      ? ((emailAnalytics.sent / (emailAnalytics.sent + emailAnalytics.failed)) * 100).toFixed(2) + '%'
      : '0%'
  };
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your email password or app password
    },
  });
};

// Generate a secure random token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate password reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, code, name = 'User') => {
  try {
    const transporter = createTransporter();
    
    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email`;
    const appName = process.env.APP_NAME || 'RoamEase';
    const currentYear = new Date().getFullYear();
    
    // Enhanced email template
    const mailOptions = {
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎉 Welcome to ${appName} - Verify Your Email`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - ${appName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Welcome to ${appName}!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your trusted logistics solution partner</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 32px;">✉️</span>
                </div>
                <h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Hi ${name}!</h2>
                <p style="color: #718096; font-size: 16px; line-height: 1.6; margin: 0;">
                  Thank you for joining ${appName}! We're excited to have you on board.
                </p>
              </div>
              
              <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🔐 Verify Your Email Address</h3>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
                  To complete your registration and start using our platform, please enter the verification code below on our website.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                    <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your verification code is:</p>
                    <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${code}
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">This code expires in 10 minutes</p>
                  </div>
                </div>
                
                <div style="background-color: #edf2f7; padding: 15px; border-radius: 6px; margin-top: 20px;">
                  <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">
                    Enter this code at: <a href="${verificationUrl}" style="color: #667eea; text-decoration: none;">${verificationUrl}</a>
                  </p>
                </div>
              </div>
              
              <!-- Features Preview -->
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">🚀 What's Next?</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                  <div style="flex: 1; min-width: 150px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 500;">Ship & Track</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 500;">Get Quotes</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🤝</div>
                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 500;">Connect</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #2d3748; padding: 30px; text-align: center; color: #a0aec0;">
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 500;">
                  ⏰ This verification link expires in 24 hours
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5;">
                  If you didn't create an account with ${appName}, please ignore this email.<br>
                  This is an automated message, please do not reply.
                </p>
              </div>
              <div style="border-top: 1px solid #4a5568; padding-top: 20px;">
                <p style="margin: 0; font-size: 12px;">
                  © ${currentYear} ${appName}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to ${appName}!
        
        Hi ${name}!
        
        Thank you for joining ${appName}! We're excited to have you on board.
        
        To complete your registration and start using our platform, please verify your email address using the code below:
        
        Your verification code is: ${code}
        
        Enter this code at: ${verificationUrl}
        
        This verification code will expire in 10 minutes.
        
        What's Next?
        - Ship & Track your packages
        - Get competitive quotes
        - Connect with logistics partners
        
        If you didn't create an account with ${appName}, please ignore this email.
        
        Best regards,
        The ${appName} Team
        
        © ${currentYear} ${appName}. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logEmailActivity('verification', email, true);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logEmailActivity('verification', email, false, error);
    return { success: false, error: error.message };
  }
};

// Send resend verification email
const sendResendVerificationEmail = async (email, code, name = 'User') => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email`;
    const appName = process.env.APP_NAME || 'RoamEase';
    const currentYear = new Date().getFullYear();
    
    const mailOptions = {
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🔄 Reminder: Verify Your Email - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification Reminder - ${appName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Email Verification Reminder</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${appName} - Complete Your Registration</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 32px;">⏰</span>
                </div>
                <h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Hi ${name}!</h2>
                <p style="color: #718096; font-size: 16px; line-height: 1.6; margin: 0;">
                  We noticed you haven't verified your email address yet.
                </p>
              </div>
              
              <div style="background-color: #fff5f5; border-left: 4px solid #f56565; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">⚠️ Action Required</h3>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
                  To access all features of ${appName} and ensure the security of your account, 
                  please verify your email address using the code below.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);">
                    <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your verification code is:</p>
                    <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${code}
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">This code expires in 10 minutes</p>
                  </div>
                </div>
                
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 6px; margin-top: 20px;">
                  <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">
                    Enter this code at: <a href="${verificationUrl}" style="color: #f56565; text-decoration: none;">${verificationUrl}</a>
                  </p>
                </div>
              </div>
              
              <!-- Benefits -->
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">🎯 Why Verify Your Email?</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                  <div style="flex: 1; min-width: 150px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🔒</div>
                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 500;">Account Security</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📧</div>
                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 500;">Important Updates</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🚀</div>
                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 500;">Full Access</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #2d3748; padding: 30px; text-align: center; color: #a0aec0;">
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 500;">
                  ⏰ This verification link expires in 24 hours
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5;">
                  If you didn't create an account with ${appName}, please ignore this email.<br>
                  This is an automated message, please do not reply.
                </p>
              </div>
              <div style="border-top: 1px solid #4a5568; padding-top: 20px;">
                <p style="margin: 0; font-size: 12px;">
                  © ${currentYear} ${appName}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Email Verification Reminder - ${appName}
        
        Hi ${name}!
        
        We noticed you haven't verified your email address yet. To access all features of ${appName} and ensure the security of your account, please verify your email using the code below:
        
        Your verification code is: ${code}
        
        Enter this code at: ${verificationUrl}
        
        Why Verify Your Email?
        - Account Security: Protect your account from unauthorized access
        - Important Updates: Receive notifications about your shipments
        - Full Access: Unlock all platform features
        
        This verification code will expire in 10 minutes.
        
        If you didn't create an account with ${appName}, please ignore this email.
        
        Best regards,
        The ${appName} Team
        
        © ${currentYear} ${appName}. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logEmailActivity('resend-verification', email, true);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logEmailActivity('resend-verification', email, false, error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, code, name = 'User') => {
  try {
    const transporter = createTransporter();
    const appName = process.env.APP_NAME || 'RoamEase';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password`;
    const currentYear = new Date().getFullYear();

    const mailOptions = {
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Password Reset Request - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - ${appName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Password Reset</h1>
              <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">${appName}</p>
            </div>
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #ffffff; font-size: 32px;">🔒</span>
                </div>
                <h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                <p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.5;">Hi ${name}! We received a request to reset your password.</p>
              </div>
              
              <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 15px 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                  Use the verification code below to reset your password. This code will expire in 1 hour for security reasons.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                    <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your reset code is:</p>
                    <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${code}
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">This code expires in 1 hour</p>
                  </div>
                </div>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #a0aec0; text-align: center;">
                  Enter this code at: <a href="${resetUrl}" style="color: #667eea; text-decoration: none;">${resetUrl}</a>
                </p>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Security Tips:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.6;">
                  <li>Choose a strong password with at least 8 characters</li>
                  <li>Use a combination of letters, numbers, and symbols</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Never share your password with anyone</li>
                </ul>
              </div>
              
              <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #c53030;">
                  <strong>Important:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
              
              <div style="border-top: 1px solid #4a5568; padding-top: 20px;">
                <p style="margin: 0; font-size: 12px;">
                  © ${currentYear} ${appName}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - ${appName}
        
        Hi ${name}!
        
        We received a request to reset your password for your ${appName} account.
        
        To reset your password, please use the verification code below:
        
        Your reset code is: ${code}
        
        Enter this code at: ${resetUrl}
        
        This code will expire in 1 hour for security reasons.
        
        Security Tips:
        - Choose a strong password with at least 8 characters
        - Use a combination of letters, numbers, and symbols
        - Don't reuse passwords from other accounts
        - Never share your password with anyone
        
        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        
        Best regards,
        The ${appName} Team
        
        © ${currentYear} ${appName}. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logEmailActivity('password-reset', email, true);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logEmailActivity('password-reset', email, false, error);
    return { success: false, error: error.message };
  }
};

// Send congratulatory email for normal user after verification
const sendNormalUserSignupEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    const appName = 'RoamEase';
    const currentYear = new Date().getFullYear();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const info = await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎉 Welcome to ${appName} - Your Account is Verified!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You have successfully signed up to ${appName}</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome, ${name}! 👋</h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining ${appName}! We're excited to have you on board. You can now start posting shipments and connecting with trusted logistics partners.
              </p>
              
              <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🚀 Ready to Get Started?</h3>
                <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">You can now post a shipment and find the perfect logistics partner for your needs.</p>
                <a href="${frontendUrl}/user/post-shipment" style="display: inline-block; background-color: white; color: #38a169; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  Post Your First Shipment
                </a>
              </div>
              
              <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Complete your email verification to access all features</li>
                  <li>Post your shipment with detailed requirements</li>
                  <li>Receive bids from verified logistics partners</li>
                  <li>Choose the best partner for your shipment</li>
                  <li>Track your shipment in real-time</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">
                  © ${currentYear} ${appName}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Congratulations! You have successfully signed up to ${appName}
        
        Hi ${name}!
        
        Thank you for joining ${appName}! We're excited to have you on board. You can now start posting shipments and connecting with trusted logistics partners.
        
        Ready to get started? Visit: ${frontendUrl}/user/post-shipment
        
        What's Next?
        - Complete your email verification to access all features
        - Post your shipment with detailed requirements
        - Receive bids from verified logistics partners
        - Choose the best partner for your shipment
        - Track your shipment in real-time
        
        © ${currentYear} ${appName}. All rights reserved.
      `
    });

    logEmailActivity('normal-user-signup', email, true);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logEmailActivity('normal-user-signup', email, false, error);
    return { success: false, error: error.message };
  }
};

// Send congratulatory email for logistics user signup
const sendLogisticsUserSignupEmail = async (email, companyName) => {
  try {
    const transporter = createTransporter();
    const appName = 'RoamEase';
    const currentYear = new Date().getFullYear();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const info = await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎉 Welcome to ${appName} - Subscribe to Get Verified!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You have successfully signed up to ${appName}</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome, ${companyName}! 🚛</h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining ${appName} as a logistics partner! We're excited to have you on board. To get started, you'll need to subscribe and get verified.
              </p>
              
              <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">📋 Next Steps</h3>
                <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">Please subscribe so you can get verified and start bidding on posted shipments.</p>
                <a href="${frontendUrl}/logistics/subscriptions" style="display: inline-block; background-color: white; color: #dd6b20; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  View Subscription Plans
                </a>
              </div>
              
              <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Complete your email verification to access all features</li>
                  <li>Choose a subscription plan that fits your business</li>
                  <li>Upload required documents for verification</li>
                  <li>Get verified by our admin team</li>
                  <li>Start bidding on posted shipments</li>
                  <li>Build your reputation with successful deliveries</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">
                  © ${currentYear} ${appName}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Congratulations! You have successfully signed up to ${appName}
        
        Hi ${companyName}!
        
        Thank you for joining ${appName} as a logistics partner! We're excited to have you on board. To get started, you'll need to subscribe and get verified.
        
        Next Steps:
        - Complete your email verification to access all features
        - Choose a subscription plan that fits your business
        - Upload required documents for verification
        - Get verified by our admin team
        - Start bidding on posted shipments
        - Build your reputation with successful deliveries
        
        View subscription plans: ${frontendUrl}/logistics/subscriptions
        
        © ${currentYear} ${appName}. All rights reserved.
      `
    });

    logEmailActivity('logistics-user-signup', email, true);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logEmailActivity('logistics-user-signup', email, false, error);
    return { success: false, error: error.message };
  }
};

// Send congratulatory email for logistics user verification
const sendLogisticsVerificationEmail = async (email, companyName) => {
  try {
    const transporter = createTransporter();
    const appName = 'RoamEase';
    const currentYear = new Date().getFullYear();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const info = await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎉 Congratulations! You are now verified on ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Complete - ${appName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You are now verified on ${appName}</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome, ${companyName}! ✅</h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! Your account has been successfully verified. You can now bid on posted shipments and start growing your business with ${appName}.
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🚀 Ready to Start Bidding?</h3>
                <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">You can now bid on posted shipments and start building your reputation.</p>
                <a href="${frontendUrl}/logistics/available-shipments" style="display: inline-block; background-color: white; color: #667eea; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  View Available Shipments
                </a>
              </div>
              
              <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What You Can Do Now:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Browse available shipments in your area</li>
                  <li>Submit competitive bids on shipments</li>
                  <li>Communicate directly with shippers</li>
                  <li>Track your active shipments</li>
                  <li>Build your reputation with successful deliveries</li>
                  <li>Earn ratings and reviews from satisfied customers</li>
                </ul>
              </div>
              
              <div style="background-color: #e6fffa; border: 1px solid #81e6d9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #234e52; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">💡 Pro Tips for Success:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #234e52; font-size: 14px; line-height: 1.6;">
                  <li>Submit detailed and competitive bids</li>
                  <li>Respond quickly to shipment requests</li>
                  <li>Maintain excellent communication with shippers</li>
                  <li>Deliver on time and in perfect condition</li>
                  <li>Ask for reviews after successful deliveries</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0; font-size: 12px; color: #a0aec0; text-align: center;">
                  © ${currentYear} ${appName}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Congratulations! You are now verified on ${appName}
        
        Hi ${companyName}!
        
        Great news! Your account has been successfully verified. You can now bid on posted shipments and start growing your business with ${appName}.
        
        What You Can Do Now:
        - Browse available shipments in your area
        - Submit competitive bids on shipments
        - Communicate directly with shippers
        - Track your active shipments
        - Build your reputation with successful deliveries
        - Earn ratings and reviews from satisfied customers
        
        View available shipments: ${frontendUrl}/logistics/available-shipments
        
        Pro Tips for Success:
        - Submit detailed and competitive bids
        - Respond quickly to shipment requests
        - Maintain excellent communication with shippers
        - Deliver on time and in perfect condition
        - Ask for reviews after successful deliveries
        
        © ${currentYear} ${appName}. All rights reserved.
      `
    });

    logEmailActivity('logistics-verification', email, true);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logEmailActivity('logistics-verification', email, false, error);
    return { success: false, error: error.message };
  }
};

// Send notification email
const sendNotificationEmail = async (email, name, notification) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email configuration not found. Notification email data:', {
      to: email,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: new Date().toISOString()
    });
    return {
      success: true,
      message: 'Email configuration not set up. Notification details logged to console.'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"RoamEase" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🔔 ${notification.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .notification-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
            .priority-high { border-left: 4px solid #dc3545; }
            .priority-medium { border-left: 4px solid #ffc107; }
            .priority-low { border-left: 4px solid #28a745; }
            .priority-urgent { border-left: 4px solid #6f42c1; }
            .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .btn:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .metadata { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 RoamEase Notification</h1>
              <p>Hello ${name}, you have a new notification</p>
            </div>
            
            <div class="content">
              <div class="notification-card priority-${notification.priority || 'medium'}">
                <h2>${notification.title}</h2>
                <p>${notification.message}</p>
                
                ${notification.metadata && Object.keys(notification.metadata).length > 0 ? `
                  <div class="metadata">
                    <h4>Details:</h4>
                    <ul>
                      ${Object.entries(notification.metadata).map(([key, value]) => 
                        `<li><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</li>`
                      ).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                ${notification.actions && notification.actions.length > 0 ? `
                  <div style="text-align: center; margin: 20px 0;">
                    ${notification.actions.map(action => 
                      `<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${action.url}" class="btn">${action.label}</a>`
                    ).join('')}
                  </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <p>This notification was sent from RoamEase</p>
                <p>You can manage your notification preferences in your account settings.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        RoamEase Notification
        
        Hello ${name},
        
        ${notification.title}
        
        ${notification.message}
        
        ${notification.metadata && Object.keys(notification.metadata).length > 0 ? `
        Details:
        ${Object.entries(notification.metadata).map(([key, value]) => `${key}: ${value}`).join('\n')}
        ` : ''}
        
        ${notification.actions && notification.actions.length > 0 ? `
        Actions:
        ${notification.actions.map(action => `${action.label}: ${process.env.FRONTEND_URL || 'http://localhost:3000'}${action.url}`).join('\n')}
        ` : ''}
        
        ---
        This notification was sent from RoamEase
        You can manage your notification preferences in your account settings.
      `
    });

    console.log('✅ Notification email sent successfully:', {
      to: email,
      messageId: info.messageId,
      type: notification.type,
      title: notification.title
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateVerificationToken,
  generateVerificationCode,
  generateResetToken,
  sendVerificationEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail,
  sendNormalUserSignupEmail,
  sendLogisticsUserSignupEmail,
  sendLogisticsVerificationEmail,
  sendNotificationEmail,
  getEmailAnalytics,
};
