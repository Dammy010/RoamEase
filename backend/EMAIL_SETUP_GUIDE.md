# 📧 Email Notifications Setup Guide

## 🔍 Current Issue
You're not receiving email notifications because the SMTP configuration is not set up on your Render deployment.

## 🚀 Quick Fix

### Step 1: Set up SMTP Environment Variables on Render

1. **Go to your Render dashboard**
2. **Navigate to your backend service**
3. **Go to Environment tab**
4. **Add these environment variables:**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://roam-ease.vercel.app
```

### Step 2: Gmail Setup (if using Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

### Step 3: Test Email Configuration

Run the test script to verify everything is working:

```bash
npm run test-email
```

## 📋 Email Notifications You Should Receive

### When Creating Shipments:
- ✅ **Shipment Created** - Confirmation email to you
- ✅ **New Shipment Available** - Email to all logistics providers

### When Shipment Status Changes:
- ✅ **Status Updated** - Email when status changes
- ✅ **Shipment Assigned** - Email when logistics provider is assigned
- ✅ **Shipment Delivered** - Email when marked as delivered

### When Location Updates:
- ✅ **Location Update** - Periodic emails during tracking
- ✅ **Milestone Achieved** - Emails for significant progress

### Admin Notifications:
- ✅ **User Suspension** - Email when user is suspended
- ✅ **User Reactivation** - Email when user is unsuspended

## 🔧 Alternative Email Providers

### Gmail (Recommended)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid (Professional)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## 🧪 Testing

### Test Email Service
```bash
npm run test-email
```

### Test Specific Notifications
1. Create a new shipment
2. Update shipment status
3. Check server logs for notification creation
4. Check your email inbox (and spam folder)

## 🐛 Troubleshooting

### Common Issues:

1. **"Email configuration not found"**
   - Check that all SMTP environment variables are set
   - Verify the variable names are correct

2. **"Authentication failed"**
   - Check your email and password
   - For Gmail, use App Password, not regular password
   - Ensure 2FA is enabled for Gmail

3. **"Connection timeout"**
   - Check SMTP_HOST and SMTP_PORT
   - Verify firewall settings
   - Try different port (465 for SSL)

4. **Emails going to spam**
   - Check spam/junk folder
   - Use professional email content
   - Consider using a dedicated email service

### Debug Steps:

1. **Check server logs** for email sending attempts
2. **Run test script** to verify configuration
3. **Check email provider** for delivery issues
4. **Verify environment variables** are set correctly

## 📊 Monitoring

The email service includes analytics:
- Sent emails count
- Failed emails count
- Success rate
- Last sent timestamp
- Error logs

Check server logs for email activity and any errors.

## 🎯 Next Steps

1. **Set up SMTP environment variables** on Render
2. **Test email configuration** using the test script
3. **Create a test shipment** to trigger notifications
4. **Check your email inbox** for notifications
5. **Monitor server logs** for any email errors

---

**Need help?** Check the server logs for detailed error messages and email sending status.