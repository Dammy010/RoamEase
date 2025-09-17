const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },             // in kobo (Paystack's smallest currency unit)
    currency: { type: String, default: 'NGN' },
    paystackReference: { type: String, required: true, index: true },
    paystackAccessCode: { type: String },
    status: { type: String, enum: ['pending', 'success', 'failed', 'abandoned'], default: 'pending' },
    gatewayResponse: { type: String },
    channel: { type: String },
    paidAt: { type: Date },
    authorizationCode: { type: String },
    customerCode: { type: String },
    receiptUrl: { type: String, default: null },

    // Optional references to business objects (e.g., subscription, bid, shipment)
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
