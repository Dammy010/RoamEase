import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllConversationsForAdmin } from "../../redux/slices/adminSlice";
import { useNavigate } from "react-router-dom";
import { 
  MessageSquare, 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  User, 
  Building2,
  ChevronRight,
  MessageCircle,
  Calendar,
  Eye,
  Archive
} from "lucide-react";

const AdminChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allConversations, loading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");

  useEffect(() => {
    dispatch(fetchAllConversationsForAdmin());
  }, [dispatch]);

  // Filter and sort conversations
  const filteredConversations = allConversations
    .filter(conversation => {
      const matchesSearch = conversation.participants.some(p => 
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.contactName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesRole = filterRole === "all" || 
        conversation.participants.some(p => p.role === filterRole);
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "updatedAt":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "createdAt":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "participants":
          return b.participants.length - a.participants.length;
        default:
          return 0;
      }
    });

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
        color: 'text-blue-600'
      };
    } else {
      return {
        name: participant.name || participant.email || 'Unknown User',
        type: 'User',
        icon: User,
        color: 'text-green-600'
      };
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Conversations</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Chat Management
                </h1>
                <p className="text-gray-500">
                  {allConversations.length} conversation{allConversations.length !== 1 ? 's' : ''} • Admin Panel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations by participant name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            <option value="all">All Roles</option>
            <option value="user">Users Only</option>
            <option value="logistics">Logistics Only</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            <option value="updatedAt">Last Updated</option>
            <option value="createdAt">Date Created</option>
            <option value="participants">Most Participants</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
      {allConversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Conversations Found</h3>
            <p className="text-gray-500">There are no conversations to display at the moment.</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Matching Conversations</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredConversations.map((conversation) => (
            <div 
              key={conversation._id} 
                className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 dark:border-gray-700/50 overflow-hidden"
              onClick={() => navigate(`/admin/chat/${conversation._id}`)}
            >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Conversation</h3>
                        <p className="text-sm text-gray-500">ID: {conversation._id.slice(-8)}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>

                  {/* Participants */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Participants ({conversation.participants.length})
                    </h4>
                    <div className="space-y-2">
                      {conversation.participants.map((participant, index) => {
                        const info = getParticipantInfo(participant);
                        const IconComponent = info.icon;
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              participant.role === 'logistics' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              <IconComponent className={`w-4 h-4 ${info.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {info.name}
                              </p>
                              <p className="text-xs text-gray-500">{info.type}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 bg-gray-50/50">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(conversation.updatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/chat/${conversation._id}`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Conversation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminChatList;
