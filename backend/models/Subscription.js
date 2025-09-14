const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  plan: { 
    type: String, 
    enum: ['basic'], 
    default: 'basic' 
  },
  billingCycle: { 
    type: String, 
    enum: ['weekly', 'monthly', 'yearly'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'cancelled', 'expired'], 
    default: 'inactive' 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'usd' 
  },
  paymentId: String,
  stripeSubscriptionId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  expiresAt: Date,
  cancelledAt: Date,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);