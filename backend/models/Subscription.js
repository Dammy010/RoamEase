import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  logistics: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  paymentId: String,
  expiresAt: Date,
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);