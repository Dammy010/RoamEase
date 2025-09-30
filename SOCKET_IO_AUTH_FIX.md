# 🔐 Socket.IO Authentication Fix Guide

## 🎯 Problem

Getting "Authentication error: Invalid token" when connecting to Socket.IO with deployed app.

## 🔧 Complete Solution

### 1. **Frontend Socket Connection (Enhanced)**

The frontend now includes:

- ✅ **Detailed token logging** before connection
- ✅ **Token structure validation**
- ✅ **Expiration checking**
- ✅ **Enhanced error handling**
- ✅ **Debug utilities**

**Key Features:**

```javascript
// Token is passed in auth object
auth: {
  token: token, // ✅ Correct way for Socket.IO v4
}

// Enhanced logging
console.log("🔐 Token details:", {
  hasToken: !!token,
  tokenLength: token.length,
  tokenPreview: token.substring(0, 20) + "...",
  tokenEnd: "..." + token.substring(token.length - 10),
});
```

### 2. **Backend Socket Authentication (Enhanced)**

The backend now includes:

- ✅ **JWT_SECRET validation**
- ✅ **Detailed token logging**
- ✅ **Enhanced error messages**
- ✅ **Token expiration checking**
- ✅ **User validation**

**Key Features:**

```javascript
// Enhanced token extraction
const authToken = socket.handshake.auth?.token;
const headerToken = socket.handshake.headers.authorization?.split(" ")[1];
const token = authToken || headerToken;

// JWT verification with detailed logging
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 3. **Debug Utilities**

Added `backend/utils/jwtDebug.js` for debugging:

- ✅ **Token structure analysis**
- ✅ **Expiration checking**
- ✅ **JWT_SECRET validation**

## 🚀 How to Use

### **Frontend Usage:**

```javascript
import { initSocket, debugToken } from "./services/socket";

// Initialize socket after login
const socket = initSocket();

// Debug token if needed
const tokenInfo = debugToken();
console.log("Token debug:", tokenInfo);
```

### **Backend Usage:**

```javascript
const { debugToken, checkJWTSecret } = require("./utils/jwtDebug");

// Check JWT configuration
checkJWTSecret();

// Debug a token
const tokenInfo = debugToken(token);
```

## 🔍 Debugging Steps

### **1. Check Frontend Token**

```javascript
// In browser console
const token = localStorage.getItem("token");
console.log("Token:", token);

// Use debug function
import { debugToken } from "./services/socket";
debugToken();
```

### **2. Check Backend JWT_SECRET**

```javascript
// In backend console
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Present" : "Missing");
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
```

### **3. Check Token Generation**

Ensure your login endpoint generates tokens with the same JWT_SECRET:

```javascript
// In authController.js
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
```

## 🚨 Common Issues & Solutions

### **Issue 1: JWT_SECRET Mismatch**

**Problem:** Different JWT_SECRET used for signing vs verification
**Solution:** Ensure same JWT_SECRET in both login and socket auth

### **Issue 2: Token Expired**

**Problem:** Token expired before socket connection
**Solution:** Implement token refresh or extend token expiry

### **Issue 3: Token Format Issues**

**Problem:** Malformed token
**Solution:** Check token generation and storage

### **Issue 4: Environment Variables**

**Problem:** JWT_SECRET not available in production
**Solution:** Check deployment environment variables

## 📊 Expected Console Logs

### **Frontend (Success):**

```
🔌 Initializing Socket.IO connection to: https://roamease-3wg1.onrender.com
🔐 Token details: { hasToken: true, tokenLength: 200, ... }
✅ Socket.IO connected successfully!
🔍 Connection details: { socketId: "abc123", transport: "websocket", ... }
```

### **Backend (Success):**

```
🔍 Socket connection attempt: { socketId: "abc123", origin: "https://roam-ease.vercel.app" }
🔐 Token extraction: { hasAuthToken: true, authTokenPreview: "eyJhbGciOiJIUzI1NiIs..." }
✅ Token decoded successfully: { userId: "507f1f77bcf86cd799439011", ... }
✅ Socket authentication successful: { socketId: "abc123", userId: "507f1f77bcf86cd799439011" }
```

### **Frontend (Error):**

```
❌ Socket.io connection error: Authentication error: Invalid token
🔍 Error details: { message: "Authentication error: Invalid token", ... }
🔐 Authentication error - token might be invalid
🔍 Token structure: { parts: 3, header: {...}, payload: {...} }
```

### **Backend (Error):**

```
❌ JWT verification failed: { error: "invalid signature", name: "JsonWebTokenError" }
❌ Socket connection rejected: Authentication error: Invalid token
```

## 🔧 Environment Variables Check

Ensure these are set in your deployment:

```bash
# Backend .env
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Frontend .env
VITE_API_BASE_URL=https://roamease-3wg1.onrender.com/api
```

## 🎉 Expected Results

After implementing this solution:

1. **✅ Detailed logging** for token validation
2. **✅ Clear error messages** for debugging
3. **✅ Proper JWT verification** with expiration checks
4. **✅ Enhanced error handling** for common issues
5. **✅ Debug utilities** for troubleshooting

## 🚀 Next Steps

1. **Deploy the updated code**
2. **Check console logs** for detailed debugging info
3. **Verify JWT_SECRET** is consistent between login and socket auth
4. **Test token expiration** handling
5. **Monitor connection success** rates

This solution provides comprehensive debugging and should resolve your Socket.IO authentication issues! 🎉
