import React, { useEffect } from "react";
import { X, Download } from "lucide-react";

const FullScreenImageViewer = ({
  isOpen,
  onClose,
  imageUrl,
  altText = "Image",
}) => {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `profile-picture-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Image container with close button positioned relative to image */}
      <div className="relative">
        {/* Close Button - positioned at top-right of the image */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Just the image - no container, no background, no rounded corners */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
          onError={(e) => {
            console.error("Failed to load image:", e.target.src);
            e.target.style.display = "none";
          }}
        />
      </div>
    </div>
  );
};

export default FullScreenImageViewer;
