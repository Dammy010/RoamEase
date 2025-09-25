const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// Configure Cloudinary only if credentials are available
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('⚠️ Cloudinary not configured, using local storage fallback');
}

// Ensure upload directories exist for local storage
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create storage configurations for different file types
const createStorage = (folder) => {
  if (isCloudinaryConfigured()) {
    try {
      return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
          folder: folder,
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt'],
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Resize images
        },
      });
    } catch (error) {
      console.error('❌ CloudinaryStorage error:', error.message);
      // Fallback to local storage if Cloudinary fails
      return createLocalStorage(folder);
    }
  } else {
    return createLocalStorage(folder);
  }
};

// Create local storage configuration
const createLocalStorage = (folder) => {
  const localDir = `uploads/${folder.split('/').pop()}`;
  ensureDir(localDir);
  
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, localDir);
    },
    filename: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  });
};

// Storage configurations
const photoStorage = createStorage('roamease/photos');
const documentStorage = createStorage('roamease/documents');
const profileStorage = createStorage('roamease/profiles');
const chatStorage = createStorage('roamease/chat');

// File filters
const photoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for photos!'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, Word docs, and text files are allowed!'), false);
  }
};

// Create upload instances
const photoUpload = multer({ 
  storage: photoStorage, 
  fileFilter: photoFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const documentUpload = multer({ 
  storage: documentStorage, 
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const profileUpload = multer({ 
  storage: profileStorage, 
  fileFilter: photoFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const chatUpload = multer({ 
  storage: chatStorage, 
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Export upload configurations
module.exports = {
  photoUpload: photoUpload.fields([
    { name: 'photos', maxCount: 10 }
  ]),
  documentUpload: documentUpload.fields([
    { name: 'documents', maxCount: 10 }
  ]),
  profileUpload: profileUpload.single('profilePicture'),
  chatUpload: chatUpload.single('file'),
  
  // Single field uploads
  singlePhotoUpload: photoUpload.single('photo'),
  singleDocumentUpload: documentUpload.single('document'),
  
  // Utility function to get Cloudinary URL
  getCloudinaryUrl: (publicId) => {
    if (!publicId) return null;
    return cloudinary.url(publicId);
  }
};
