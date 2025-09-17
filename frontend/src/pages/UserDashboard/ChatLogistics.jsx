import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedConversation } from "../../redux/slices/chatSlice";
import ChatList from "../../components/chat/ChatList";
import ChatBox from "../../components/chat/ChatBox";
import { ArrowRight } from "lucide-react";

const ChatLogistics = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const dispatch = useDispatch();

  // Set the selected conversation if conversationId is provided in URL
  useEffect(() => {
    if (conversationId) {
      dispatch(setSelectedConversation(conversationId));
    }
  }, [conversationId, dispatch]);

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar with Chat List */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* Back Button - Top Right of Chat List */}
        <div className="flex justify-end p-3">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="p-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
            title="Back to Dashboard"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList />
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 p-4">
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatLogistics;
