// client/src/components/chat/MessageBubble.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Download, FileText, Image, ExternalLink } from "lucide-react";

const MessageBubble = ({ message }) => {
  const { user } = useSelector((state) => state.auth);
  const isMine = message.sender._id === user._id;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileDownload = (attachment) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderAttachment = (attachment) => {
    // Check if it's an image by type or file extension
    const isImage = attachment.type === 'image' || 
                   attachment.type?.startsWith('image/') ||
                   /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.name);
    
    if (isImage) {
      return (
        <div className="mb-2">
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
            onError={(e) => {
              // Fallback to file display if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden text-xs text-gray-400 mt-1">
            <p>{attachment.name}</p>
            <p>{formatFileSize(attachment.size)}</p>
          </div>
          {/* Download button for images */}
          <button
            onClick={() => handleFileDownload(attachment)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            title="Download image"
          >
            Download Image
          </button>
        </div>
      );
    } else {
      return (
        <div className="mb-2 p-3 bg-gray-100 rounded-lg border max-w-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
            </div>
            <button
              onClick={() => handleFileDownload(attachment)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              title="Download file"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-6 group`}>
      <div className={`max-w-xs lg:max-w-md ${isMine ? "order-2" : "order-1"}`}>
        {/* Sender Info */}
        <div className={`text-xs text-gray-500 mb-2 px-2 ${isMine ? "text-right" : "text-left"}`}>
          {message.sender.name}
        </div>
        
        {/* Message Content */}
        <div
          className={`p-4 rounded-2xl break-words shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:shadow-xl ${
            isMine 
              ? "bg-blue-500 text-white border border-blue-400/20" 
              : "bg-white/90 text-gray-900 border border-gray-200/50"
          }`}
        >
          {/* Text Message */}
          {message.text && (
            <div className="mb-2">{message.text}</div>
          )}
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={attachment.id || index}>
                  {renderAttachment(attachment)}
                </div>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            isMine ? "text-blue-100/80" : "text-gray-500"
          }`}>
            {new Date(message.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
