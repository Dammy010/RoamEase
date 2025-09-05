import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllConversationsForAdmin } from "../../redux/slices/adminSlice";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Users as UsersIcon } from "lucide-react";

const AdminChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allConversations, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllConversationsForAdmin());
  }, [dispatch]);

  if (loading) return <p className="p-6">Loading conversations...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">💬 All Conversations</h2>
      {allConversations.length === 0 ? (
        <p className="text-gray-600">No conversations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allConversations.map((conversation) => (
            <div 
              key={conversation._id} 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => navigate(`/admin/chat/${conversation._id}`)}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <MessageSquare className="mr-2 text-blue-500" size={20} />
                Conversation ID: {conversation._id}
              </h3>
              <div className="space-y-2 mb-4">
                <p className="flex items-center text-gray-700">
                  <UsersIcon className="mr-2 text-gray-400" size={16} />
                  <span className="font-medium">Participants:</span>
                  {conversation.participants.map(p => p.name || p.email).join(', ')}
                </p>
                <p className="text-sm text-gray-500">
                  Last Updated: {new Date(conversation.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatList;



