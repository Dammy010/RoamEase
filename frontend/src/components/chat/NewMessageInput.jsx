// client/src/components/chat/NewMessageInput.jsx
import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage, addMessage } from "../../redux/slices/chatSlice";
import { getSocket } from "../../services/socket";
import { Smile, Paperclip, Image, FileText, Send, X } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

const NewMessageInput = ({ conversationId }) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;

    try {
      // Send via API only - the API will handle database storage
      const resultAction = await dispatch(sendMessage({ 
        conversationId, 
        text: text.trim(),
        attachments: attachments
      }));

      if (sendMessage.fulfilled.match(resultAction)) {
        // Emit via socket for real-time delivery to other users (without creating duplicate in DB)
        const socket = getSocket();
        if (socket) {
          socket.emit("broadcast-message", { 
            message: resultAction.payload, // Send the created message object
            conversationId
          });
        }
        
        // Clear form after successful send
        setText("");
        setAttachments([]);
        setShowEmojiPicker(false);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        setIsUploading(true);
        console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        console.log('Uploading to:', `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/chat/upload`);
        
        // Upload file to backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/chat/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        // Add uploaded file to attachments
        const newAttachment = {
          id: Date.now() + Math.random(),
          name: result.file.name,
          type: result.file.type,
          size: result.file.size,
          url: result.file.url
        };
        
        setAttachments(prev => [...prev, newAttachment]);
        console.log('File added to attachments:', newAttachment);
        
      } catch (error) {
        console.error('File upload error:', error);
        alert(`Failed to upload file: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border-t bg-white">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-2 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                {attachment.type.startsWith('image/') ? (
                  <img src={attachment.url} alt={attachment.name} className="w-8 h-8 object-cover rounded" />
                ) : (
                  <FileText className="w-8 h-8 text-blue-500" />
                )}
                <div className="text-xs">
                  <p className="font-medium truncate max-w-24">{attachment.name}</p>
                  <p className="text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="relative">
          <EmojiPicker 
            onEmojiSelect={addEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center p-4">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl mr-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Smile size={20} />
        </button>

        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl mr-2 transition-all duration-200 shadow-sm hover:shadow-md"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>

        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl mr-2 transition-all duration-200 shadow-sm hover:shadow-md"
          title="Attach image"
        >
          <Image size={20} />
        </button>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => handleFileUpload(e, 'document')}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e, 'image')}
          className="hidden"
        />

        {/* Text Input */}
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-3 border-0 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white shadow-sm text-gray-700 placeholder-gray-500"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && attachments.length === 0) || isUploading}
          className={`ml-3 p-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 ${
            (text.trim() || attachments.length > 0) && !isUploading
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default NewMessageInput;

