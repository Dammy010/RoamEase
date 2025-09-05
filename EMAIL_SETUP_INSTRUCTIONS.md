# 📧 Email Verification Setup Instructions

## 🚨 **Current Issue: Invalid SMTP Credentials**

Your `.env` file currently has placeholder values that won't work:
```
SMTP_HOST: smtp.mailtrap.io
SMTP_USER: your_user
SMTP_PASS: your_pass
```

## 🛠 **Solution: Choose One of These Options**

### **Option 1: Gmail (Recommended - Free)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password (like: `abcd-efgh-ijkl-mnop`)

3. **Update your `.env` file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### **Option 2: Mailtrap (Testing Service)**

1. **Sign up at [Mailtrap.io](https://mailtrap.io/)**
2. **Get your credentials** from the inbox
3. **Update your `.env` file:**
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-mailtrap-username
   SMTP_PASS=your-mailtrap-password
   ```

### **Option 3: Outlook/Hotmail**

1. **Enable SMTP** in Outlook settings
2. **Update your `.env` file:**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   ```

## 🧪 **Test Your Configuration**

After updating your `.env` file, test it:

```bash
cd backend
node test-email.js
```

**Expected output:**
```
✅ Test email sent successfully!
🎉 Email configuration is working correctly!
```

## 🚀 **Complete .env Template**

Replace the values in your `backend/.env` file:

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

# Email Configuration (REPLACE THESE VALUES)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=your-actual-app-password

# App Configuration
APP_NAME=RoamEase

# Email Verification
EMAIL_VERIFICATION_ENABLED=true
VERIFICATION_TOKEN_EXPIRES=24h
```

## ✅ **Verification Steps**

1. **Update `.env`** with real credentials
2. **Test email service:** `node test-email.js`
3. **Restart backend:** `npm start`
4. **Test registration** on frontend
5. **Check email** for verification link

## 🐛 **Troubleshooting**

### **"Invalid login" error:**
- Use App Password, not regular password
- For Gmail: Enable 2FA first

### **"Connection timeout" error:**
- Check firewall settings
- Try port 465 with SSL

### **"Authentication failed" error:**
- Verify credentials are correct
- Check username/password in .env

### **Emails go to spam:**
- Check spam folder
- Mark as not spam
- Add SPF/DKIM records (advanced)

## 🎯 **Expected Flow After Fix**

1. **User registers** → Backend sends verification email
2. **User receives email** → With verification link
3. **User clicks link** → Email gets verified
4. **User can login** → Full access granted

---

**Need help?** Run `node test-email.js` to see specific error messages!
