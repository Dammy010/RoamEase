// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  createConversation, 
  getConversations, 
  sendMessage, 
  getMessages,
  markConversationAsRead,
  deleteMessage
} = require('../controllers/chatController');
const upload = require('../middlewares/uploadMiddleware');

// Chat routes
router.post('/conversations', protect, createConversation);
router.get('/conversations', protect, getConversations);
router.post('/messages', protect, sendMessage);
router.get('/messages/:id', protect, getMessages);
router.delete('/messages/:messageId', protect, deleteMessage);
router.put('/conversations/:conversationId/read', protect, markConversationAsRead);

// File upload for chat attachments
router.post('/upload', protect, (req, res, next) => {
  console.log("DEBUG: /api/chat/upload route hit - before multer");
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error("DEBUG: Multer error in /api/chat/upload:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, (req, res) => {
  console.log("DEBUG: /api/chat/upload route hit - after multer");
  try {
    if (!req.file) {
      console.log("DEBUG: No file uploaded after multer");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create full file URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/chat/${req.file.filename}`;
    
    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

module.exports = router;
