# MongoDB Setup Guide - Quick Fix

## 🚨 Current Issue
Your backend server is running perfectly (`🚀 Server running on port 5000`) but can't connect to MongoDB because it's not installed locally.

## 🚀 **Option 1: MongoDB Atlas (Cloud - Recommended - 2 minutes)**

### Step 1: Create Free MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Build a database" → "FREE" tier

### Step 2: Create Cluster
1. Choose "AWS" as provider
2. Select a region close to you
3. Keep default cluster name "Cluster0"
4. Click "Create Cluster"

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### Step 4: Update Your .env File
Replace the MONGODB_URI in your `backend/.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/roamease?retryWrites=true&w=majority
```

### Step 5: Restart Your Server
```bash
cd backend
npm run dev
```

## 🖥️ **Option 2: Local MongoDB Installation**

### Windows (Using Chocolatey)
```powershell
# Install Chocolatey if you don't have it
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install MongoDB
choco install mongodb

# Start MongoDB service
net start MongoDB
```

### Windows (Manual Installation)
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB service: `net start MongoDB`

## 🔧 **Option 3: Use Docker (If you have Docker)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## ✅ **Test Your Setup**
Once MongoDB is connected, test these endpoints:
- `http://localhost:5000/api/debug/health`
- `http://localhost:5000/api/debug/db-status`

## 🎯 **Recommended: Use MongoDB Atlas**
- ✅ Works immediately (no installation needed)
- ✅ Free tier (512MB storage)
- ✅ No local setup required
- ✅ Works from anywhere
- ✅ Automatic backups

Your backend server is already working perfectly - it just needs a database to connect to!
