// client/src/components/chat/ChatNotification.jsx
import React from "react";

const ChatNotification = ({ count }) => {
  if (!count) return null;
  return (
    <span className="ml-1 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
      {count}
    </span>
  );
};

export default ChatNotification;
