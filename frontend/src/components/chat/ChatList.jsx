// client/src/components/chat/ChatList.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchConversations,
  setSelectedConversation,
  addMessageToConversation,
  markConversationAsRead, // New: Import markConversationAsRead thunk
} from "../../redux/slices/chatSlice";
import { getSocket } from "../../services/socket";

const ChatList = () => {
  const dispatch = useDispatch();
  const { conversations, selectedConversationId, loadingConversations, messages } =
    useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const socket = getSocket();

  // Track unread counts locally (though Redux now manages global unread)
  // This local state might be removed or streamlined if Redux fully handles it.
  const [unreadCounts, setUnreadCounts] = useState({});

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Update last message preview and unread counts on incoming socket messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // Dispatch to Redux to add message and update global unread counts
      dispatch(addMessageToConversation(msg));

      // Local unread count update - might be redundant if Redux is the source of truth
      if (msg.conversationId !== selectedConversationId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.conversationId]: (prev[msg.conversationId] || 0) + 1,
        }));
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, dispatch, selectedConversationId]);

  // Reset unread count when selecting a conversation
  const handleSelectConversation = (convId) => {
    dispatch(setSelectedConversation(convId));
    dispatch(markConversationAsRead(convId)); // New: Dispatch to backend to mark as read
    setUnreadCounts((prev) => ({ ...prev, [convId]: 0 })); // Reset local unread count
  };

  return (
    <div className="w-64 border-r h-full overflow-y-auto bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/50 flex-shrink-0">
      <h2 className="text-lg font-bold p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Chats</h2>

      {loadingConversations ? (
        <p className="text-center text-gray-400 mt-4">Loading chats...</p>
      ) : conversations.length === 0 ? (
        <p className="text-center text-gray-400 mt-4">No chats available</p>
      ) : (
        <ul>
          {conversations.map((conv) => {
            const lastMsg = conv.lastMessage?.text || "";
            // Use unreadCount directly from Redux conversation object if available,
            // otherwise fallback to local state or 0.
            const displayUnreadCount = conv.unreadCount !== undefined ? conv.unreadCount : (unreadCounts[conv._id] || 0);
            
            // Get other participants (excluding current user)
            const otherParticipants = conv.participants.filter(p => p._id !== user._id);

            return (
              <li
                key={conv._id}
                onClick={() => handleSelectConversation(conv._id)}
                className={`relative cursor-pointer p-4 border-b border-gray-200/50 hover:bg-white/80 hover:shadow-sm transition-all duration-200 ${
                  selectedConversationId === conv._id ? "bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-semibold truncate flex-1 ${
                    selectedConversationId === conv._id ? "text-blue-600" : "text-gray-800"
                  }`}>
                    {otherParticipants.length > 0 
                      ? otherParticipants.map((p) => {
                          // Debug: Log participant data
                          console.log('Participant data:', p);
                          
                          if (p.role === 'logistics' || p.role === 'logistics') {
                            // For logistics users, prioritize company name
                            const displayName = p.companyName || p.contactName || p.name || p.email || 'Unknown Company';
                            console.log('Logistics user, display name:', displayName);
                            return displayName;
                          } else {
                            // For regular users, use name or email
                            const displayName = p.name || p.email || 'Unknown User';
                            console.log('Regular user, display name:', displayName);
                            return displayName;
                          }
                        }).join(", ")
                      : 'Unknown User'
                    }
                  </p>
                </div>
                
                {/* Hide last message preview */}
                {/* <p className="text-sm text-gray-600 truncate">
                  {lastMsg}
                </p> */}

                {displayUnreadCount > 0 && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    {displayUnreadCount}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
