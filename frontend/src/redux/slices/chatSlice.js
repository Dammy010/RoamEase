// client/src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// =====================
// Async Thunks
// =====================
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat/conversations"); // Corrected: now correctly includes /chat
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/chat/messages/${conversationId}`); // Corrected: now correctly includes /chat
      return { conversationId, messages: data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, text, attachments }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/chat/messages`, { 
        conversationId, 
        text: text || "", 
        attachments: attachments || [] 
      }); // Corrected: now correctly includes /chat
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// New: Async Thunk to create a conversation
export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async ({ recipientId, shipmentId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/chat/conversations", { recipientId, shipmentId }); // Corrected: now correctly includes /chat
      return data; // The created conversation
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// New: Async Thunk to mark a conversation as read on the backend
export const markConversationAsRead = createAsyncThunk(
  "chat/markConversationAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`); // Corrected: now correctly includes /chat
      return conversationId; // Return conversationId to update state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// =====================
// Initial State
// =====================
const initialState = {
  conversations: [], // each includes unreadCount
  messages: {}, // { conversationId: [messages] }
  loadingConversations: false,
  loadingMessages: false,
  error: null,
  selectedConversationId: null,
  unreadCount: 0, // ✅ global unread counter
};

// =====================
// Helpers
// =====================
const calculateTotalUnread = (conversations) =>
  conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

// =====================
// Slice
// =====================
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedConversation: (state, action) => {
      const convId = action.payload;
      state.selectedConversationId = convId;

      // Reset unread count for opened conversation locally
      const convIndex = state.conversations.findIndex((c) => c._id === convId);
      if (convIndex !== -1) {
        state.conversations[convIndex].unreadCount = 0;
      }
      state.unreadCount = calculateTotalUnread(state.conversations);
      // No longer dispatch markConversationAsRead here, it will be handled by the component
    },

    addConversation: (state, action) => {
      const newConversation = action.payload;
      // Ensure the conversation doesn't already exist before adding
      if (!state.conversations.some(conv => conv._id === newConversation._id)) {
        state.conversations.unshift(newConversation);
        state.unreadCount = calculateTotalUnread(state.conversations);
      }
    },

    addMessage: (state, action) => {
      const message = action.payload;
      const convId = message.conversation._id || message.conversation;

      if (!state.messages[convId]) state.messages[convId] = [];
      state.messages[convId].push(message);

      const convIndex = state.conversations.findIndex((c) => c._id === convId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;

        // Increment unread count if not active conversation
        if (state.selectedConversationId !== convId) {
          state.conversations[convIndex].unreadCount =
            (state.conversations[convIndex].unreadCount || 0) + 1;
        } else {
          // If message is added to selected conversation, ensure its unread count is 0
          state.conversations[convIndex].unreadCount = 0;
        }
      }

      state.unreadCount = calculateTotalUnread(state.conversations);
    },

    // This reducer is likely for socket-received messages
    addMessageToConversation: (state, action) => {
      const message = action.payload;
      const convId = message.conversationId || message.conversation._id;

      if (!state.messages[convId]) state.messages[convId] = [];
      state.messages[convId].push(message);

      const convIndex = state.conversations.findIndex((c) => c._id === convId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;

        // Increment unread count if not active conversation
        if (state.selectedConversationId !== convId) {
          state.conversations[convIndex].unreadCount =
            (state.conversations[convIndex].unreadCount || 0) + 1;
        } else {
          // If message is added to selected conversation (via socket), ensure its unread count is 0
          state.conversations[convIndex].unreadCount = 0;
        }
      }

      state.unreadCount = calculateTotalUnread(state.conversations);
    },
  },

  extraReducers: (builder) => {
    // Fetch conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.loadingConversations = true;
      state.error = null;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.loadingConversations = false;
      state.conversations = action.payload.map((c) => ({
        ...c,
        unreadCount: c.unreadCount || 0,
      }));
      state.unreadCount = calculateTotalUnread(state.conversations);
      console.log('Chat slice - Conversations fetched:', state.conversations);
      console.log('Chat slice - Total unread count:', state.unreadCount);
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.loadingConversations = false;
      state.error = action.payload;
    });

    // Create conversation
    builder.addCase(createConversation.pending, (state) => {
      state.loadingConversations = true; // Indicate loading for conversations
      state.error = null;
    });
    builder.addCase(createConversation.fulfilled, (state, action) => {
      state.loadingConversations = false;
      const newConversation = action.payload;
      // Add the new conversation to the list if it doesn't already exist
      if (!state.conversations.some(conv => conv._id === newConversation._id)) {
        state.conversations.unshift(newConversation);
      }
      state.selectedConversationId = newConversation._id; // Automatically select the new conversation
      state.unreadCount = calculateTotalUnread(state.conversations); // Recalculate global unread count
    });
    builder.addCase(createConversation.rejected, (state, action) => {
      state.loadingConversations = false;
      state.error = action.payload;
    });

    // Fetch messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loadingMessages = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loadingMessages = false;
      state.messages[action.payload.conversationId] = action.payload.messages;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loadingMessages = false;
      state.error = action.payload;
    });

    // Send message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const message = action.payload;
      const convId = message.conversation._id || message.conversation;

      if (!state.messages[convId]) state.messages[convId] = [];
      state.messages[convId].push(message);

      const convIndex = state.conversations.findIndex((c) => c._id === convId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        // Sent messages are considered read, ensure unread count is 0 for sender
        state.conversations[convIndex].unreadCount = 0;
      }

      state.unreadCount = calculateTotalUnread(state.conversations);
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.error = action.payload;
    });

    // New: Mark conversation as read
    builder.addCase(markConversationAsRead.fulfilled, (state, action) => {
      const conversationId = action.payload;
      const convIndex = state.conversations.findIndex((c) => c._id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].unreadCount = 0;
      }
      state.unreadCount = calculateTotalUnread(state.conversations);
    });
    builder.addCase(markConversationAsRead.rejected, (state, action) => {
      console.error("Failed to mark conversation as read:", action.payload);
      state.error = action.payload;
    });
  },
});

// =====================
// Exports
// =====================
export const {
  setSelectedConversation,
  addMessage,
  addMessageToConversation,
  addConversation,
} = chatSlice.actions;
export default chatSlice.reducer;
