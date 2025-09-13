import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount, addNotification } from '../redux/slices/notificationSlice';
import { getSocket } from '../services/socket';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    // Only load unread count and setup socket if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      // Load initial unread count
      dispatch(getUnreadCount()).catch((error) => {
        console.log('🔔 Failed to load unread count (user may not be authenticated):', error);
      });
      
      // Set up real-time notifications via Socket.io
      const setupSocket = () => {
        const socket = getSocket();
        if (socket) {
          console.log('🔔 Setting up notification listener on socket:', socket.id);
          
          // Handle new notifications
          socket.on('new-notification', (notification) => {
            console.log('🔔 Received new notification:', notification);
            dispatch(addNotification(notification));
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification._id
              });
            }
          });
          
          // Handle socket connection events
          socket.on('connect', () => {
            console.log('🔔 Socket connected for notifications');
            // Refresh unread count when reconnected
            dispatch(getUnreadCount());
          });
          
          socket.on('disconnect', (reason) => {
            console.log('🔔 Socket disconnected for notifications:', reason);
          });
          
          socket.on('connect_error', (error) => {
            console.error('🔔 Socket connection error:', error);
          });
          
          return socket;
        } else {
          console.log('⚠️ No socket available for notifications');
          return null;
        }
      };

      const socket = setupSocket();
    } else {
      console.log('🔔 No authentication token, skipping notification setup');
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new-notification');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
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
