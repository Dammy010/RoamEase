import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMessagesForAdmin } from "../../redux/slices/adminSlice";
import { 
  MessageSquare, 
  UserCircle, 
  ArrowLeft, 
  MoreVertical, 
  Search, 
  Filter,
  Download,
  Archive,
  Flag,
  Clock,
  Building2,
  User,
  Calendar,
  MessageCircle,
  Send,
  Paperclip,
  Image,
  FileText
} from "lucide-react";

const AdminChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAdminChatMessages, allConversations, loading, error } = useSelector((state) => state.admin);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActions, setShowActions] = useState(false);

  const conversation = allConversations.find(conv => conv._id === conversationId);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessagesForAdmin(conversationId));
    }
  }, [dispatch, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentAdminChatMessages]);

  const getParticipantInfo = (participant) => {
    if (participant.role === 'logistics') {
      // For logistics, prioritize companyName, then contactName, then name, then email
      const displayName = participant.companyName || 
                         participant.contactName || 
                         participant.name || 
                         participant.email || 
                         'Unknown Company';
      return {
        name: displayName,
        type: 'Company',
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    } else {
      return {
        name: participant.name || participant.email || 'Unknown User',
        type: 'User',
        icon: User,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }
  };

  const formatMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageDate.toLocaleDateString();
  };

  const renderAttachment = (attachment) => {
    const isImage = attachment.type === 'image' || 
                   attachment.type?.startsWith('image/') ||
                   /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.name);
    
    if (isImage) {
      return (
        <div className="mt-2">
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
          />
          <p className="text-xs text-gray-500 mt-1">{attachment.name}</p>
        </div>
      );
    } else {
      return (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg border max-w-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-gray-500">
                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : ''}
              </p>
            </div>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = attachment.url;
                link.download = attachment.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Conversation</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-gray-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Conversation Not Found</h2>
          <p className="text-gray-600">The requested conversation could not be found.</p>
        </div>
      </div>
    );
  }

  const filteredMessages = currentAdminChatMessages.filter(message =>
    message.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/chat')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Conversation Details
                </h1>
                <p className="text-sm text-gray-500">
                  {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Participants Info */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-3">
            {conversation.participants.map((participant, index) => {
              const info = getParticipantInfo(participant);
              const IconComponent = info.icon;
              return (
                <div key={index} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${info.bgColor}`}>
                  <IconComponent className={`w-4 h-4 ${info.color}`} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{info.name}</span>
                  <span className="text-xs text-gray-500">({info.type})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentAdminChatMessages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Messages Yet</h3>
            <p className="text-gray-500">This conversation doesn't have any messages yet.</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Matching Messages</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredMessages.map((message) => {
              const participantInfo = getParticipantInfo(message.sender);
              const IconComponent = participantInfo.icon;
              
              return (
                <div key={message._id} className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${participantInfo.bgColor} flex-shrink-0`}>
                      <IconComponent className={`w-6 h-6 ${participantInfo.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{participantInfo.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${participantInfo.bgColor} ${participantInfo.color}`}>
                            {participantInfo.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatMessageTime(message.createdAt)}</span>
                </div>
                      </div>
                      
                      {message.text && (
                        <p className="text-gray-700 mb-3 leading-relaxed">{message.text}</p>
                      )}
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <div key={index}>
                              {renderAttachment(attachment)}
              </div>
            ))}
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Message ID: {message._id.slice(-8)}</span>
                          <span>{new Date(message.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Actions Panel */}
      {showActions && (
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/50 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Messages</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-lg transition-colors">
                <Archive className="w-4 h-4" />
                <span>Archive Conversation</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 rounded-lg transition-colors">
                <Flag className="w-4 h-4" />
                <span>Flag for Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatWindow;
