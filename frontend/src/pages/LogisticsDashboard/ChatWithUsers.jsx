import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import ChatList from "../../components/chat/ChatList";
import ChatBox from "../../components/chat/ChatBox";
import { MessageSquare, Users, Settings, ArrowLeft } from "lucide-react";

const ChatWithUsers = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex h-full min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-700">
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
