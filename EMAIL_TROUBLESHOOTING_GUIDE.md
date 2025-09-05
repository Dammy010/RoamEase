# 🔧 Email Verification Troubleshooting Guide

## 🚨 **Issue: Not Receiving Verification Emails**

### **Root Cause Analysis:**
The email verification system is not working because **SMTP credentials are not configured**. The backend is trying to send emails but failing silently due to missing environment variables.

---

## 🛠 **Step-by-Step Fix**

### **1. Create Environment File**

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/roamease

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-change-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:5173

# Email Configuration (SMTP) - REQUIRED FOR EMAIL VERIFICATION
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here

# App Configuration
APP_NAME=RoamEase

# Email Verification
EMAIL_VERIFICATION_ENABLED=true
VERIFICATION_TOKEN_EXPIRES=24h
```

### **2. Set Up Gmail SMTP (Recommended)**

#### **Option A: Gmail with App Password (Recommended)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Update .env file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

#### **Option B: Other Email Providers**

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### **3. Test Email Configuration**

Create a test file `backend/test-email.js`:

```javascript
const { sendVerificationEmail } = require('./utils/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***hidden***' : 'NOT SET');
  
  const result = await sendVerificationEmail(
    'test@example.com', 
    'test-token-123', 
    'Test User'
  );
  
  console.log('Email test result:', result);
}

testEmail().catch(console.error);
```

Run the test:
```bash
cd backend
node test-email.js
```

---

## 🔍 **Debugging Steps**

### **1. Check Backend Logs**

Start the backend and look for email-related errors:

```bash
cd backend
npm start
```

Look for these log messages:
- ✅ `Email verification sent successfully to email@example.com`
- ❌ `Email verification failed to email@example.com: [error]`

### **2. Check Email Analytics**

The system tracks email sending statistics. Check the logs for:
- `Email analytics: { sent: X, failed: Y, successRate: 'Z%' }`

### **3. Verify Environment Variables**

Add this to your backend startup to verify configuration:

```javascript
// Add to backend/index.js after dotenv.config()
console.log('📧 Email Configuration:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configured***' : '❌ NOT SET');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
```

---

## 🚀 **Quick Fix Commands**

### **1. Create .env file:**
```bash
cd backend
echo "SMTP_HOST=smtp.gmail.com" > .env
echo "SMTP_PORT=587" >> .env
echo "SMTP_USER=your-email@gmail.com" >> .env
echo "SMTP_PASS=your-app-password" >> .env
echo "CLIENT_URL=http://localhost:5173" >> .env
echo "APP_NAME=RoamEase" >> .env
```

### **2. Install missing dependencies (if needed):**
```bash
cd backend
npm install nodemailer
```

### **3. Restart backend:**
```bash
cd backend
npm start
```

---

## 📧 **Email Provider Setup Guides**

### **Gmail Setup (Most Common)**

1. **Enable 2FA** on your Google account
2. **Generate App Password:**
   - Google Account → Security → 2-Step Verification
   - App passwords → Select app: Mail
   - Copy the 16-character password
3. **Use in .env:**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd-efgh-ijkl-mnop
   ```

### **Outlook Setup**

1. **Enable SMTP** in Outlook settings
2. **Use credentials:**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   ```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Invalid login" error**
- **Solution:** Use App Password, not regular password
- **For Gmail:** Enable 2FA and generate App Password

### **Issue 2: "Connection timeout" error**
- **Solution:** Check firewall settings, try port 465 with SSL
- **Alternative:** Use different SMTP provider

### **Issue 3: "Authentication failed" error**
- **Solution:** Verify SMTP credentials are correct
- **Check:** Username and password in .env file

### **Issue 4: Emails go to spam**
- **Solution:** Add SPF/DKIM records to your domain
- **Quick fix:** Check spam folder, mark as not spam

---

## ✅ **Verification Checklist**

- [ ] `.env` file created in `backend` directory
- [ ] SMTP credentials configured correctly
- [ ] Backend restarted after .env changes
- [ ] Test email sent successfully
- [ ] Check spam folder for verification emails
- [ ] Email verification link works correctly

---

## 🎯 **Expected Behavior After Fix**

1. **User registers** → Backend sends verification email
2. **User receives email** → With verification link
3. **User clicks link** → Email gets verified
4. **User can login** → Full access granted

---

## 📞 **Still Having Issues?**

If you're still not receiving emails after following this guide:

1. **Check backend logs** for specific error messages
2. **Try different email provider** (Outlook, Yahoo, etc.)
3. **Test with a different email address**
4. **Check spam/junk folder**
5. **Verify SMTP settings** with your email provider

The most common issue is missing or incorrect SMTP credentials in the `.env` file.
