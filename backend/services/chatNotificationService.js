const NotificationService = require('./notificationService');
const User = require('../models/User');

class ChatNotificationService {
  /**
   * Create a notification for a new message
   */
  static async createMessageNotification(message, conversation) {
    try {
      // Get the recipient (the other participant in the conversation)
      const recipient = conversation.participants.find(
        participant => participant.toString() !== message.sender.toString()
      );

      console.log('Conversation participants:', conversation.participants);
      console.log('Message sender:', message.sender);
      console.log('Found recipient:', recipient);

      if (!recipient) {
        console.log('No recipient found for message notification');
        return null;
      }

      // Get sender details for the notification
      const sender = await User.findById(message.sender).select('name email role');
      if (!sender) {
        console.log('Sender not found for message notification');
        return null;
      }

      // Create notification data
      const notificationData = {
        recipient: recipient,
        type: 'new_message',
        title: `New message from ${sender.name}`,
        message: message.text ? 
          (message.text.length > 100 ? message.text.substring(0, 100) + '...' : message.text) :
          'Sent an attachment',
        priority: 'medium',
        relatedEntity: {
          type: 'conversation',
          id: conversation._id
        },
        metadata: {
          conversationId: conversation._id,
          senderId: message.sender,
          senderName: sender.name,
          messageId: message._id,
          hasAttachments: message.attachments && message.attachments.length > 0
        },
        actions: [
          {
            label: 'View Message',
            action: 'view',
            url: `/chat?conversation=${conversation._id}`,
            method: 'GET'
          }
        ]
      };

      // Create the notification
      const notification = await NotificationService.createNotification(notificationData);
      
      console.log(`Chat notification created for user ${recipient}:`, notification.title);
      console.log(`Notification details:`, {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipient: notification.recipient
      });
      return notification;
    } catch (error) {
      console.error('Error creating chat notification:', error);
      throw error;
    }
  }

  /**
   * Create a notification for conversation started
   */
  static async createConversationStartedNotification(conversation, initiator) {
    try {
      // Get the other participant
      const recipient = conversation.participants.find(
        participant => participant.toString() !== initiator.toString()
      );

      if (!recipient) {
        console.log('No recipient found for conversation started notification');
        return null;
      }

      // Get initiator details
      const initiatorUser = await User.findById(initiator).select('name email role');
      if (!initiatorUser) {
        console.log('Initiator not found for conversation started notification');
        return null;
      }

      const notificationData = {
        recipient: recipient,
        type: 'conversation_started',
        title: `New conversation with ${initiatorUser.name}`,
        message: `${initiatorUser.name} started a new conversation with you`,
        priority: 'medium',
        relatedEntity: {
          type: 'conversation',
          id: conversation._id
        },
        metadata: {
          conversationId: conversation._id,
          initiatorId: initiator,
          initiatorName: initiatorUser.name
        },
        actions: [
          {
            label: 'View Conversation',
            action: 'view',
            url: `/chat?conversation=${conversation._id}`,
            method: 'GET'
          }
        ]
      };

      const notification = await NotificationService.createNotification(notificationData);
      
      console.log(`Conversation started notification created for user ${recipient}:`, notification.title);
      return notification;
    } catch (error) {
      console.error('Error creating conversation started notification:', error);
      throw error;
    }
  }

  /**
   * Mark conversation notifications as read when user opens the conversation
   */
  static async markConversationNotificationsAsRead(userId, conversationId) {
    try {
      const Notification = require('../models/Notification');
      
      await Notification.updateMany(
        {
          recipient: userId,
          'metadata.conversationId': conversationId,
          status: 'unread'
        },
        {
          status: 'read',
          readAt: new Date()
        }
      );

      console.log(`Marked conversation notifications as read for user ${userId}, conversation ${conversationId}`);
    } catch (error) {
      console.error('Error marking conversation notifications as read:', error);
      throw error;
    }
  }
}

module.exports = ChatNotificationService;
