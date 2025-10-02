// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
  markConversationAsRead,
  deleteMessage,
} = require("../controllers/chatController");
const {
  upload,
  uploadChatFile,
} = require("../middlewares/cloudinaryUploadMiddleware");

// Chat routes
router.post("/conversations", protect, createConversation);
router.get("/conversations", protect, getConversations);
router.post("/messages", protect, sendMessage);
router.get("/messages/:id", protect, getMessages);
router.delete("/messages/:messageId", protect, deleteMessage);
router.put(
  "/conversations/:conversationId/read",
  protect,
  markConversationAsRead
);

// File upload for chat attachments
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  console.log("DEBUG: /api/chat/upload route hit");
  try {
    if (!req.file) {
      console.log("DEBUG: No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("DEBUG: File uploaded:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferSize: req.file.buffer.length,
    });

    // Upload to Cloudinary
    const cloudinaryResult = await uploadChatFile(
      req.file.buffer,
      req.file.originalname
    );

    console.log("DEBUG: Cloudinary upload successful:", {
      public_id: cloudinaryResult.public_id,
      secure_url: cloudinaryResult.secure_url,
    });

    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
});

module.exports = router;
