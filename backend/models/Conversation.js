// backend/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    lastMessage: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
    // New: Reference to the shipment if the conversation is initiated from an accepted bid
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: false },
    // New: Field to track unread message counts for each participant
    unreadCounts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        count: { type: Number, default: 0 }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
