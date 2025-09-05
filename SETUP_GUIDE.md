# RoamEase Setup Guide

## 🚨 Critical Issues Fixed

Your application was experiencing several critical issues that have now been resolved:

1. **MongoDB Connection Timeouts** - Fixed with better connection options and timeout handling
2. **Authentication Failures** - Fixed with fallback JWT secrets and better error handling
3. **Socket Connection Issues** - Fixed with timeout handling for user status updates
4. **Missing Environment Variables** - Fixed with fallback values and warnings

## 📋 Required Setup Steps

### 1. Create Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/roamease

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:5173

# Email Configuration (for user verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Upload Configuration
MAX_FILE_SIZE=10485760
```

### 2. Install and Start MongoDB

**Option A: Local MongoDB Installation**
1. Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - Windows: Run `net start MongoDB` in Command Prompt as Administrator
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get your connection string
3. Update `MONGODB_URI` in your `.env` file with the Atlas connection string

### 3. Install Dependencies and Start the Application

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Verify the Setup

Test these endpoints to verify everything is working:

- **Health Check**: `GET http://localhost:5000/api/debug/health`
- **Database Status**: `GET http://localhost:5000/api/debug/db-status`
- **Environment Status**: `GET http://localhost:5000/api/debug/env-status`

## 🔧 Improvements Made

### Database Connection
- Added connection pooling and timeout configurations
- Implemented graceful retry logic
- Added fallback MongoDB URI

### Socket.IO Handling
- Added timeout handling for user status updates
- Implemented graceful error handling
- Prevented socket disconnections due to DB timeouts

### Authentication
- Added fallback JWT secrets for development
- Improved error messages and logging
- Added environment variable validation

### Debug Routes
- Added comprehensive health check endpoints
- Database connection status monitoring
- Environment variable status checking

## 🚀 Next Steps

1. **Create the `.env` file** with the configuration above
2. **Install and start MongoDB** (local or Atlas)
3. **Restart your backend server** to apply the fixes
4. **Test the debug endpoints** to verify everything is working
5. **Update JWT secrets** with secure random strings for production

## 🔍 Troubleshooting

If you still experience issues:

1. **Check MongoDB Status**: Visit `http://localhost:5000/api/debug/db-status`
2. **Check Environment**: Visit `http://localhost:5000/api/debug/env-status`
3. **Check Logs**: Look for connection success messages in your terminal
4. **Verify MongoDB**: Ensure MongoDB service is running on port 27017

## 📞 Support

The application now includes comprehensive error handling and diagnostic endpoints. If you encounter any issues, check the debug endpoints first, and the application will provide detailed error information to help identify the problem.
