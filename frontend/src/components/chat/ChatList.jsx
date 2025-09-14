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
    <div className="w-64 border-r h-full bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/50 flex-shrink-0 flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <h2 className="text-lg font-bold p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Chats</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto chat-scroll">
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
                className={`relative cursor-pointer p-4 border-b border-gray-200/50 hover:bg-white/80 hover:shadow-sm transition-all duration-300 group ${
                  selectedConversationId === conv._id ? "bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    {(() => {
                      const participant = otherParticipants.length > 0 ? otherParticipants[0] : null;
                      
                      // Check all possible avatar fields
                      const avatarFields = ['avatar', 'profilePicture', 'image', 'profileImage', 'photo', 'picture'];
                      let avatarUrl = null;
                      
                      for (const field of avatarFields) {
                        if (participant?.[field]) {
                          avatarUrl = participant[field];
                          break;
                        }
                      }
                      
                      // Debug logging - show all participant data
                      console.log('=== CHAT LIST DEBUG ===');
                      console.log('Participant:', participant);
                      console.log('All participant keys:', Object.keys(participant || {}));
                      console.log('Avatar URL found:', avatarUrl);
                      console.log('========================');
                      
                      if (avatarUrl) {
                        // Convert relative URL to full URL
                        const fullAvatarUrl = avatarUrl.startsWith('http') 
                          ? avatarUrl 
                          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${avatarUrl}`;
                        
                        console.log('🖼️ Full avatar URL:', fullAvatarUrl);
                        
                        return (
                          <img 
                            src={fullAvatarUrl} 
                            alt={participant?.name || participant?.companyName || 'Participant'} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                            onError={(e) => {
                              console.log('❌ Image failed to load:', fullAvatarUrl);
                              console.log('Error details:', e);
                              // Fallback to initials if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={() => {
                              console.log('✅ Image loaded successfully:', fullAvatarUrl);
                            }}
                          />
                        );
                      }
                      
                      return null;
                    })()}
                    <span className={`text-sm font-bold text-white ${(() => {
                      const participant = otherParticipants.length > 0 ? otherParticipants[0] : null;
                      const avatarFields = ['avatar', 'profilePicture', 'image', 'profileImage', 'photo', 'picture'];
                      const hasAvatar = avatarFields.some(field => participant?.[field]);
                      return hasAvatar ? 'hidden' : 'flex';
                    })()}`}>
                      {otherParticipants.length > 0 
                        ? (() => {
                            const participant = otherParticipants[0];
                            const displayName = participant?.companyName || participant?.name || participant?.email || 'U';
                            return displayName[0]?.toUpperCase() || 'U';
                          })()
                        : 'U'
                      }
                    </span>
                  </div>
                  
                  {/* Name and Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${
                      selectedConversationId === conv._id ? "text-blue-600" : "text-gray-800"
                    }`}>
                      {otherParticipants.length > 0 
                        ? otherParticipants.map((p) => {
                            if (p.role === 'logistics') {
                              // For logistics users, prioritize company name
                              return p.companyName || p.contactName || p.name || p.email || 'Unknown Company';
                            } else {
                              // For regular users, use name or email
                              return p.name || p.email || 'Unknown User';
                            }
                          }).join(", ")
                        : 'Unknown User'
                      }
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {otherParticipants.length > 0 && otherParticipants[0]?.role === 'logistics' 
                        ? 'Logistics Partner' 
                        : 'User'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Hide last message preview */}
                {/* <p className="text-sm text-gray-600 truncate">
                  {lastMsg}
                </p> */}

                {displayUnreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse min-w-[20px] h-5 flex items-center justify-center">
                    {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
                  </span>
                )}
              </li>
            );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;
