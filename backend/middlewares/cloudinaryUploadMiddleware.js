const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const path = require("path");

// Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for different file types
const fileFilter = (req, file, cb) => {
  console.log("🔍 Cloudinary Upload Middleware: File filter check:", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Profile pictures - only images
  if (file.fieldname === "profilePicture") {
    if (file.mimetype.startsWith("image/")) {
      console.log("✅ Profile picture accepted");
      return cb(null, true);
    }
    return cb(
      new Error("Only image files are allowed for profile pictures!"),
      false
    );
  }

  // Chat attachments - images and documents
  if (file.fieldname === "file") {
    const allowedTypes = /jpg|jpeg|png|gif|webp|pdf|doc|docx|txt|zip|rar/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      console.log("✅ Chat attachment accepted");
      return cb(null, true);
    }
    return cb(
      new Error(
        "Only images and common document types are allowed for chat attachments!"
      ),
      false
    );
  }

  // Shipment photos - only images
  if (file.fieldname === "photos") {
    if (file.mimetype.startsWith("image/")) {
      console.log("✅ Shipment photo accepted");
      return cb(null, true);
    }
    return cb(
      new Error("Only image files are allowed for shipment photos!"),
      false
    );
  }

  // Documents - accept various types
  if (
    [
      "documents",
      "businessLicense",
      "insuranceCertificate",
      "governmentId",
    ].includes(file.fieldname)
  ) {
    console.log("✅ Document accepted");
    return cb(null, true);
  }

  console.log("❌ Invalid file field:", file.fieldname);
  return cb(new Error(`Invalid file field: ${file.fieldname}`), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
        },
      });

// Helper function to upload buffer to Cloudinary with different configurations
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "roamease",
        resource_type: "auto", // Auto-detect file type
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create a readable stream from the buffer
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    // Pipe the buffer stream to Cloudinary upload stream
    bufferStream.pipe(uploadStream);
  });
};

// Specific upload functions for different file types
const uploadProfilePicture = async (buffer) => {
  return uploadToCloudinary(buffer, {
    folder: "roamease/profiles",
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
};

const uploadChatFile = async (buffer, originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);

  return uploadToCloudinary(buffer, {
    folder: "roamease/chat",
    resource_type: isImage ? "image" : "raw",
    transformation: isImage
      ? [{ quality: "auto", fetch_format: "auto" }]
      : undefined,
  });
};

const uploadShipmentPhoto = async (buffer) => {
  return uploadToCloudinary(buffer, {
    folder: "roamease/shipments",
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
};

const uploadDocument = async (buffer, fieldname) => {
  return uploadToCloudinary(buffer, {
    folder: `roamease/documents/${fieldname}`,
    resource_type: "raw",
  });
};

// Create a middleware that handles both file uploads and no files
const flexibleUpload = (req, res, next) => {
  console.log("🔍 flexibleUpload - Content-Type:", req.headers["content-type"]);
  console.log(
    "🔍 flexibleUpload - Request body keys:",
    Object.keys(req.body || {})
  );

  // If no files are being uploaded, skip multer entirely
  if (
    !req.headers["content-type"] ||
    !req.headers["content-type"].includes("multipart/form-data")
  ) {
    console.log("🔍 flexibleUpload - No multipart data, skipping multer");
    // Set empty files object for consistency
    req.files = {};
    return next();
  }

  // Use multer for file uploads
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ])(req, res, next);
};

// Add error handling middleware
const handleUploadError = (error, req, res, next) => {
  console.error("❌ Upload middleware error:", error);
  console.error("❌ Upload error details:", {
    message: error.message,
    code: error.code,
    field: error.field,
    name: error.name,
  });

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Your file is too large. Please upload files under 10MB.",
        error: error.message,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 10 files per field.",
        error: error.message,
      });
    }
  }

  next(error);
};

module.exports = {
  upload,
  uploadToCloudinary,
  uploadProfilePicture,
  uploadChatFile,
  uploadShipmentPhoto,
  uploadDocument,
  flexibleUpload,
  handleUploadError,
};
