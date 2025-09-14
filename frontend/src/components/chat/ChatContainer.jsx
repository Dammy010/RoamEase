import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversations } from '../../redux/slices/chatSlice';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import { MessageCircle, Search, Settings, MoreVertical, Phone, Video, Info } from 'lucide-react';

const ChatContainer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, loadingConversations } = useSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherParticipants = conv.participants.filter(p => p._id !== user._id);
    return otherParticipants.some(p => 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-sm text-gray-500">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chat List */}
        <div className={`${isMobile ? 'w-full' : 'w-80'} border-r border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 backdrop-blur-sm flex-shrink-0 h-full`}>
          <ChatList conversations={filteredConversations} />
        </div>

        {/* Chat Box */}
        <div className={`${isMobile ? 'hidden' : 'flex-1'} flex flex-col h-full`}>
          <ChatBox />
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {isMobile && (
        <div className="fixed inset-0 bg-white dark:bg-gray-800 z-50">
          <ChatBox />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
