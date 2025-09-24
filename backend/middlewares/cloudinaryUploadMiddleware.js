const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage configurations for different file types
const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Resize images
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
