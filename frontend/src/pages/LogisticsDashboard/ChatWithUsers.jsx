import React from "react";
import ChatList from "../../components/chat/ChatList";
import ChatBox from "../../components/chat/ChatBox";

const ChatWithUsers = () => {
  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-gray-200">
        <ChatList />
      </div>

      {/* Chat Box */}
      <div className="flex-1 p-4">
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatWithUsers;
