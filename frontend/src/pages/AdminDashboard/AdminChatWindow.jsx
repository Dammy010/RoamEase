import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchMessagesForAdmin } from "../../redux/slices/adminSlice";
import { MessageSquare, UserCircle } from "lucide-react";

const AdminChatWindow = () => {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const { currentAdminChatMessages, allConversations, loading, error } = useSelector((state) => state.admin);
  const messagesEndRef = useRef(null);

  const conversation = allConversations.find(conv => conv._id === conversationId);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessagesForAdmin(conversationId));
    }
  }, [dispatch, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentAdminChatMessages]);

  if (loading) return <p className="p-6">Loading messages...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;
  if (!conversation) return <p className="p-6 text-gray-600">Conversation not found.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 text-blue-600" size={24} />
        Conversation with: {conversation.participants.map(p => p.name || p.email).join(', ')}
      </h2>

      <div className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-y-auto max-h-[70vh]">
        {currentAdminChatMessages.length === 0 ? (
          <p className="text-gray-600">No messages in this conversation.</p>
        ) : (
          <div className="space-y-4">
            {currentAdminChatMessages.map((message) => (
              <div key={message._id} className="flex items-start">
                <UserCircle className="mr-3 text-gray-500" size={24} />
                <div>
                  <p className="font-semibold text-gray-800">{message.sender.name || message.sender.email} ({message.sender.role})</p>
                  <p className="text-gray-700">{message.text}</p>
                  <p className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatWindow;



