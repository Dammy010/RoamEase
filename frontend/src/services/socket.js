import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (socket) {
    return socket;
  }
  
  const token = localStorage.getItem("token");
  
  // Only initialize socket if we have a valid token
  if (!token) {
    console.log("No token found, skipping socket initialization");
    return null;
  }
  
  socket = io("http://localhost:5000", {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    withCredentials: true,
    timeout: 20000,
    forceNew: true,
    auth: {
      token: token
    }
  });

  socket.on('connect', () => {
    console.log('Socket.io connected successfully');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
    console.error('Error details:', {
      message: error.message,
      description: error.description,
      context: error.context,
      type: error.type
    });
    
    if (error.message.includes('Authentication error')) {
      console.log('Socket authentication failed, but not logging out user automatically');
      // Don't automatically logout on socket auth errors
      // Let the API interceptor handle authentication failures
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.io disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server disconnected the client, reconnect manually
      socket.connect();
    }
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const newSocket = initSocket();
    return newSocket;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = () => {
  disconnectSocket();
  const token = localStorage.getItem("token");
  if (token) {
    return initSocket();
  } else {
    console.log("No token available for socket reconnection");
    return null;
  }
};

// Initialize socket only after successful login
export const initializeSocketAfterLogin = () => {
  const token = localStorage.getItem("token");
  if (token && !socket) {
    console.log("Initializing socket after successful login");
    return initSocket();
  }
  return socket;
};
