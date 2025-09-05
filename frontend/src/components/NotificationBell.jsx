import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount, addNotification } from '../redux/slices/notificationSlice';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(getUnreadCount());
    
    // Set up real-time notifications via Socket.io
    const socket = window.io;
    if (socket) {
      socket.on('new-notification', (notification) => {
        dispatch(addNotification(notification));
      });
    }

    return () => {
      if (socket) {
        socket.off('new-notification');
      }
    };
  }, [dispatch]);

  const handleBellClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleBellClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title="View Notifications"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
