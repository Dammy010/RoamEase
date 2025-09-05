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

module.exports = {
  generateVerificationToken,
  generateVerificationCode,
  generateResetToken,
  sendVerificationEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail,
  getEmailAnalytics,
};
