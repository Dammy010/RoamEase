// client/src/components/chat/ChatBox.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMessages, addMessage, markConversationAsRead } from "../../redux/slices/chatSlice"; // New: Import markConversationAsRead
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import MessageBubble from "./MessageBubble";
import NewMessageInput from "./NewMessageInput";

const ChatBox = () => {
  const dispatch = useDispatch();
  const { selectedConversationId, messages, loadingMessages } = useSelector(
    (state) => state.chat
  );
  const { conversations } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const msgs = messages[selectedConversationId] || [];
  const scrollRef = useRef(null);
  const socket = getSocket();

  // Get current conversation details
  const currentConversation = conversations.find(conv => conv._id === selectedConversationId);
  const otherParticipant = currentConversation?.participants?.find(p => p._id !== user?._id);

  // Fetch messages and mark as read when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      dispatch(fetchMessages(selectedConversationId));
      dispatch(markConversationAsRead(selectedConversationId)); // New: Mark as read when conversation is opened
    }
  }, [dispatch, selectedConversationId]);

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      console.log("DEBUG: Received message via socket:", msg);
      console.log("DEBUG: Current user ID:", user._id);
      console.log("DEBUG: Message sender ID:", msg.sender._id);
      
      if (msg.conversationId === selectedConversationId) {
        // Only add message if it's not from the current user (to prevent duplicates)
        if (msg.sender._id !== user._id) {
          // Check if message already exists to prevent duplicates
          const existingMessage = msgs.find(m => m._id === msg._id);
          if (!existingMessage) {
            console.log("DEBUG: Adding new message to state:", msg._id);
            // Handle message with attachments
            const enhancedMsg = {
              ...msg,
              attachments: msg.attachments || [],
              text: msg.text || ""
            };
            dispatch(addMessage(enhancedMsg));
            // New: Mark incoming message as read immediately if in active conversation
            dispatch(markConversationAsRead(selectedConversationId)); 
          } else {
            console.log("DEBUG: Duplicate message detected, skipping:", msg._id);
          }
        } else {
          console.log("DEBUG: Message from current user, skipping socket receive:", msg._id);
        }
      } else {
        console.log("DEBUG: Message not for current conversation:", msg.conversationId, "vs", selectedConversationId);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, dispatch, selectedConversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  if (!selectedConversationId)
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg font-semibold text-gray-700">Select a chat to start messaging</p>
          <p className="text-sm text-gray-500 mt-2">Choose from your conversations to begin chatting</p>
        </div>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Chat Header with Participant Info */}
      <div className="p-4 border-b bg-white/90 backdrop-blur-sm shadow-sm border-gray-200/50">
        <div className="flex items-center gap-3">
          {/* Participant Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            {otherParticipant?.avatar ? (
              <img 
                src={otherParticipant.avatar} 
                alt={otherParticipant.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {otherParticipant?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          {/* Participant Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {(() => {
                // Debug: Log participant data
                console.log('ChatBox participant data:', otherParticipant);
                
                if (otherParticipant?.role === 'logistics' || otherParticipant?.role === 'logistics') {
                  // For logistics users, prioritize company name
                  const displayName = otherParticipant?.companyName || otherParticipant?.contactName || otherParticipant?.name || otherParticipant?.email || 'Unknown Company';
                  console.log('Logistics user in chat, display name:', displayName);
                  return displayName;
                } else {
                  // For regular users, use name or email
                  const displayName = otherParticipant?.name || otherParticipant?.email || 'Unknown User';
                  console.log('Regular user in chat, display name:', displayName);
                  return displayName;
                }
              })()}
            </h3>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-white/30 to-white/50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f8fafc' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {loadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 font-medium">Loading messages...</p>
            </div>
          </div>
        ) : msgs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
              <div className="text-4xl mb-2">💭</div>
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          msgs.map((msg) => <MessageBubble key={msg._id} message={msg} />)
        )}
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <NewMessageInput conversationId={selectedConversationId} />
      </div>
    </div>
  );
};

export default ChatBox;
