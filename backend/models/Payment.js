const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },             // in cents
    currency: { type: String, default: 'usd' },
    stripePaymentIntentId: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
    receiptUrl: { type: String, default: null },

    // Optional references to business objects (e.g., subscription, bid, shipment)
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
