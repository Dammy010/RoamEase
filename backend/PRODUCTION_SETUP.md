# RoamEase Production Environment Variables Guide

## Required Environment Variables for Render Deployment

### Database

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roamease?retryWrites=true&w=majority
```

### JWT Authentication

```
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=30d
```

### Cloudinary Configuration (Required for file uploads)

```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Email Configuration (Optional but recommended)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Environment

```
NODE_ENV=production
PORT=5000
```

## How to Set Environment Variables in Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add each variable with its value
5. Click "Save Changes"
6. Redeploy your service

## Testing Your Configuration

After setting up the environment variables, you can test the shipment creation by:

1. Making sure all required fields are sent in the request
2. Checking the Render logs for any error messages
3. Using the test script: `node test-shipment-creation.js`

## Common Issues and Solutions

### 1. 500 Error on Shipment Creation

- Check if all required environment variables are set
- Verify MongoDB connection string is correct
- Check Cloudinary configuration
- Look at Render logs for specific error messages

### 2. Authentication Issues

- Ensure JWT_SECRET is set and consistent
- Check if user is properly authenticated
- Verify token is being sent in Authorization header

### 3. File Upload Issues

- Verify Cloudinary credentials are correct
- Check if files are being sent as multipart/form-data
- Ensure file size limits are appropriate

### 4. Database Connection Issues

- Verify MONGO_URI is correct
- Check if MongoDB Atlas allows connections from Render IPs
- Ensure database user has proper permissions
