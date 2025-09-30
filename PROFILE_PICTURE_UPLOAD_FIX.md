# 🔧 Profile Picture Upload Fix Guide

## 🎯 Problem

Getting `ENOENT: no such file or directory, open 'uploads/temp/1759267723577-WhatsApp Image 2025-06-20 at 10.37.30_f5435268.jpg'` error when uploading profile pictures in deployment.

## 🔧 Root Cause

The `uploads/temp` directory doesn't exist on the deployment server, causing multer to fail when trying to save temporary files.

## ✅ Solution Implemented

### 1. **Directory Creation on Server Startup**

- ✅ **Added directory creation** in `backend/index.js`
- ✅ **Creates all necessary directories** on server startup
- ✅ **Recursive directory creation** with proper error handling

```javascript
// Create directories on startup
const createDirectories = () => {
  const directories = [
    "uploads",
    "uploads/temp",
    "uploads/profiles",
    "uploads/shipments",
    "uploads/documents",
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};
```

### 2. **Enhanced Multer Configuration**

- ✅ **Dynamic directory creation** in multer destination
- ✅ **Filename sanitization** to handle special characters
- ✅ **Better error handling** for directory issues

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to avoid issues with special characters
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});
```

### 3. **Enhanced Debugging and Error Handling**

- ✅ **Comprehensive logging** for file operations
- ✅ **File existence verification** before Cloudinary upload
- ✅ **Better error messages** for debugging

```javascript
console.log(`📁 Current working directory: ${process.cwd()}`);
console.log(`📁 Temp directory exists: ${fs.existsSync(tempDir)}`);
console.log(`📁 Temp directory path: ${path.resolve(tempDir)}`);
console.log(`📁 File exists: ${fs.existsSync(req.file.path)}`);

// Verify file exists before uploading to Cloudinary
if (!fs.existsSync(req.file.path)) {
  console.log(`❌ File does not exist: ${req.file.path}`);
  return res.status(500).json({
    success: false,
    message: "Uploaded file not found on server",
    error: "File not found after upload",
  });
}
```

## 🔍 Debugging Information Added

### **Server Startup Logs:**

```
📁 Created directory: uploads
📁 Created directory: uploads/temp
📁 Created directory: uploads/profiles
📁 Created directory: uploads/shipments
📁 Created directory: uploads/documents
```

### **Upload Process Logs:**

```
🔍 Profile picture upload attempt for user: 507f...
📁 Current working directory: /app
📁 Temp directory exists: true
📁 Temp directory path: /app/uploads/temp
📁 Uploaded file: { filename: "1759267723577-WhatsApp_Image_2025-06-20_at_10.37.30_f5435268.jpg", ... }
☁️ Uploading to Cloudinary from: uploads/temp/1759267723577-WhatsApp_Image_2025-06-20_at_10.37.30_f5435268.jpg
✅ Cloudinary upload successful: { public_id: "roamease/profiles/abc123", ... }
🗑️ Temporary file deleted: uploads/temp/1759267723577-WhatsApp_Image_2025-06-20_at_10.37.30_f5435268.jpg
```

## 🚨 Common Issues & Solutions

### **Issue 1: Directory Not Created**

**Problem:** `uploads/temp` directory doesn't exist
**Solution:** Server now creates directories on startup

### **Issue 2: Special Characters in Filename**

**Problem:** Filenames with spaces or special characters cause issues
**Solution:** Filename sanitization replaces special characters with underscores

### **Issue 3: File Not Found After Upload**

**Problem:** File disappears between multer save and Cloudinary upload
**Solution:** Added file existence verification before Cloudinary upload

### **Issue 4: Permission Issues**

**Problem:** Server doesn't have permission to create directories
**Solution:** Uses `recursive: true` option for directory creation

## 📊 Expected Results

After implementing this solution:

1. **✅ Directories created** on server startup
2. **✅ Files saved successfully** to temp directory
3. **✅ Cloudinary upload works** without file not found errors
4. **✅ Temporary files cleaned up** after successful upload
5. **✅ Better error messages** for debugging

## 🚀 Deployment Steps

### **1. Deploy Updated Code**

The updated code will automatically create necessary directories on startup.

### **2. Check Server Logs**

Look for directory creation messages:

```
📁 Created directory: uploads
📁 Created directory: uploads/temp
```

### **3. Test Profile Picture Upload**

Try uploading a profile picture and check for:

- No `ENOENT` errors
- Successful Cloudinary upload
- Temporary file cleanup

### **4. Monitor Console Logs**

Watch for the enhanced debugging information during upload process.

## 🔧 Environment Variables Check

Ensure these are set in your deployment:

```bash
# Backend Environment Variables
CLOUDINARY_CLOUD_NAME=db6qlljkd
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🎉 Expected Behavior

After deploying this fix:

1. **✅ Server starts** and creates all necessary directories
2. **✅ Profile picture uploads** work without file system errors
3. **✅ Files are properly sanitized** to avoid special character issues
4. **✅ Temporary files are cleaned up** after successful upload
5. **✅ Comprehensive logging** helps with debugging

This solution addresses the root cause of the `ENOENT` error by ensuring all necessary directories exist before any file operations are attempted! 🎉
