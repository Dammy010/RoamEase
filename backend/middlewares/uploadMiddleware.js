const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDir('uploads/photos');
ensureDir('uploads/documents');
ensureDir('uploads/profiles'); // New: Directory for profile pictures
ensureDir('uploads/chat'); // New: Directory for chat attachments

// Storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    console.log('📁 Upload Middleware: Determining destination for file:', {
      fieldname: file.fieldname,
      originalname: file.originalname
    });
    
    // Store profile pictures in 'uploads/profiles'
    if (file.fieldname === 'profilePicture') {
      console.log('📁 Upload Middleware: Storing profile picture in uploads/profiles/');
      cb(null, 'uploads/profiles/');
    } 
    // Store general photos (e.g., shipment photos) in 'uploads/photos'
    else if (file.fieldname === 'photos') {
      cb(null, 'uploads/photos/');
    } 
    // Store chat attachments in 'uploads/chat'
    else if (file.fieldname === 'file') { // 'file' is the fieldname used by NewMessageInput for attachments
      cb(null, 'uploads/chat/');
    }
    // Store documents (shipment docs, businessLicense, insuranceCertificate, governmentId) in 'uploads/documents'
    else if (['documents', 'businessLicense', 'insuranceCertificate', 'governmentId'].includes(file.fieldname)) {
      cb(null, 'uploads/documents/');
    } 
    else {
      cb(new Error(`Invalid field name for file upload: ${file.fieldname}`)); // Provide more specific error
    }
  },
  filename(req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('📁 Upload Middleware: Generated filename:', filename);
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('🔍 Upload Middleware: File filter check:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (file.fieldname === 'profilePicture' || file.fieldname === 'photos') {
    // Accept only images for profile pictures and general photos
    const allowedImages = /jpg|jpeg|png|avif|webp/i; // Case-insensitive - added AVIF and WebP support
    const extname = allowedImages.test(path.extname(file.originalname));
    const mimetype = allowedImages.test(file.mimetype); // Check mimetype too
    
    console.log('🔍 Upload Middleware: Image validation:', {
      extname,
      mimetype,
      allowed: extname && mimetype
    });
    
    if (extname && mimetype) {
      console.log('✅ Upload Middleware: File accepted');
      return cb(null, true);
    }
    console.log('❌ Upload Middleware: File rejected - not a valid image');
    return cb(new Error('Only JPG, JPEG, PNG, AVIF, WebP images are allowed for profile pictures and photos!'));
  }

  // Accept images and documents for chat attachments
  if (file.fieldname === 'file') {
    const allowedTypes = /jpg|jpeg|png|gif|webp|pdf|doc|docx|txt|zip|rar/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    return cb(new Error('Only images and common document types are allowed for chat attachments!'));
  }

  // Temporarily accept any file for documents
  if (['documents', 'businessLicense', 'insuranceCertificate', 'governmentId'].includes(file.fieldname)) {
    return cb(null, true); // Accept all document types for now
  }

  cb(new Error(`Invalid file field: ${file.fieldname}`)); // Provide more specific error
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Limit file size to 50MB
});

module.exports = upload;
