// backend/controllers/chatController.js
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const ChatNotificationService = require("../services/chatNotificationService");

const createConversation = async (req, res) => {
  const { recipientId, shipmentId } = req.body; // New: Add shipmentId

  try {
    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      // New: Also consider shipmentId if provided, to prevent duplicate conversations for the same bid
      ...(shipmentId && { shipment: shipmentId }),
    });

    if (existing) return res.json(existing);

    // New conversation: initialize unread counts for both participants
    const conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      unreadCounts: [
        { user: req.user._id, count: 0 },
        { user: recipientId, count: 0 },
      ],
      ...(shipmentId && { shipment: shipmentId }), // New: Assign shipmentId to the conversation
    });

    // Create notification for new conversation
    try {
      await ChatNotificationService.createConversationStartedNotification(
        conversation,
        req.user._id
      );
    } catch (notificationError) {
      console.error(
        "Error creating conversation started notification:",
        notificationError
      );
      // Don't fail the conversation creation if notification creation fails
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate(
        "participants",
        "name role email isOnline lastSeen profilePicture profilePictureUrl profilePictureId companyName contactName contactPosition country yearsInOperation registrationNumber companySize"
      )
      .sort({ updatedAt: -1 }); // Sort by most recent for chat list

    // Manually add the current user's unread count to each conversation object
    const conversationsWithUnread = conversations.map((conv) => {
      const userUnread = conv.unreadCounts.find((uc) =>
        uc.user.equals(req.user._id)
      );
      return {
        ...conv.toObject(), // Convert Mongoose document to plain object
        unreadCount: userUnread ? userUnread.count : 0,
      };
    });

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const sendMessage = async (req, res) => {
  const { conversationId, text, attachments } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text || "",
      attachments: attachments || [],
    });

    // Update last message and increment unread count for other participants
    conversation.lastMessage = text || "Attachment shared";
    conversation.updatedAt = Date.now();

    conversation.participants.forEach((participantId) => {
      if (!participantId.equals(req.user._id)) {
        // Increment unread count for the recipient
        const unreadEntry = conversation.unreadCounts.find((uc) =>
          uc.user.equals(participantId)
        );
        if (unreadEntry) {
          unreadEntry.count += 1;
        } else {
          // Should not happen if unreadCounts is initialized correctly, but as a fallback
          conversation.unreadCounts.push({ user: participantId, count: 1 });
        }
      } else {
        // Reset sender's unread count for this conversation when they send a message
        const senderUnreadEntry = conversation.unreadCounts.find((uc) =>
          uc.user.equals(req.user._id)
        );
        if (senderUnreadEntry) {
          senderUnreadEntry.count = 0;
        }
      }
    });

    await conversation.save();

    // Create notification for the new message
    try {
      console.log(
        "🔔 Creating message notification for conversation:",
        conversation._id
      );
      console.log("📝 Message details:", {
        id: message._id,
        sender: message.sender,
        text: message.text,
        conversationId: conversation._id,
      });
      console.log("👥 Conversation participants:", conversation.participants);
      console.log("👤 Current user (sender):", req.user._id);

      const notification =
        await ChatNotificationService.createMessageNotification(
          message,
          conversation
        );
      if (notification) {
        console.log(
          "✅ Message notification created successfully:",
          notification._id
        );
      } else {
        console.log("⚠️ No notification created (returned null)");
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating message notification:",
        notificationError
      );
      console.error("❌ Error stack:", notificationError.stack);
      // Don't fail the message sending if notification creation fails
    }

    const populatedMessage = await message.populate(
      "sender",
      "name email role profilePicture profilePictureUrl profilePictureId companyName contactName contactPosition country yearsInOperation registrationNumber companySize"
    );
    res.status(201).json(populatedMessage); // Return populated message for real-time updates
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate(
        "sender",
        "name role email profilePicture profilePictureUrl profilePictureId companyName contactName contactPosition country yearsInOperation registrationNumber companySize"
      )
      .sort({ createdAt: 1 }); // Sort by oldest first for chat history
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// New: Mark a conversation as read for the current user
const markConversationAsRead = async (req, res) => {
  const { conversationId } = req.params; // Get conversationId from params

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userUnreadEntry = conversation.unreadCounts.find((uc) =>
      uc.user.equals(req.user._id)
    );
    if (userUnreadEntry) {
      userUnreadEntry.count = 0; // Set unread count to 0 for the current user
      await conversation.save();

      // Mark chat notifications as read
      try {
        await ChatNotificationService.markConversationNotificationsAsRead(
          req.user._id,
          conversationId
        );
      } catch (notificationError) {
        console.error(
          "Error marking conversation notifications as read:",
          notificationError
        );
        // Don't fail the conversation read marking if notification update fails
      }

      return res.status(200).json({ message: "Conversation marked as read" });
    } else {
      return res
        .status(404)
        .json({ message: "User not found in conversation unread counts" });
    }
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    // Update conversation's last message if this was the last message
    const conversation = await Conversation.findById(message.conversation);
    if (conversation && conversation.lastMessage === message.text) {
      // Find the new last message
      const lastMessage = await Message.findOne({
        conversation: message.conversation,
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        conversation.lastMessage = lastMessage.text || "Attachment shared";
      } else {
        conversation.lastMessage = "";
      }
      await conversation.save();
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
  markConversationAsRead, // New: Export the new function
  deleteMessage, // New: Export the delete message function
};
