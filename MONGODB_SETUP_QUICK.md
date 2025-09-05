# Quick MongoDB Setup for RoamEase

## The Issue
Your login is failing with a 500 error because MongoDB is not connected. The backend is trying to connect to a database that isn't available.

## Quick Solutions

### Option 1: Use MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Create a `.env` file in the `backend` folder:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roamease
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-in-production
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Option 2: Install MongoDB Locally
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install it
3. Start MongoDB service
4. Create a `.env` file in the `backend` folder:

```env
MONGODB_URI=mongodb://localhost:27017/roamease
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-in-production
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Option 3: Test Without Database (Limited Functionality)
The backend now has fallback mode, but you won't be able to login/register without a database.

## Check Database Status
Visit: `http://localhost:5000/api/debug/db-status`

This will show you the current database connection status.

## After Setup
1. Restart the backend server
2. Try logging in again
3. The 500 error should be resolved

## Need Help?
- Check the backend console for connection messages
- Visit the debug endpoints to troubleshoot
- Make sure your `.env` file is in the `backend` folder (not root)
