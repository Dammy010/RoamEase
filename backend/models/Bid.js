const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: [true, 'Shipment reference is required'],
    },
    carrier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The user placing the bid
      required: [true, 'Carrier reference is required'],
    },
    role: {
      type: String,
      enum: ['shipper', 'carrier', 'admin'],
      default: 'shipper',
    },
    price: {
      type: Number,
      required: [true, 'Bid price is required'],
      min: [0, 'Price must be a positive number'],
    },
    eta: {
      type: String, // e.g., "2 days", "5 hours"
      required: [true, 'Estimated time of arrival is required'],
      trim: true,
    },
    message: {
      type: String, // Optional note from carrier
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    seenByShipper: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Ensure only one accepted bid per shipment
bidSchema.index({ shipment: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'accepted' } });

module.exports = mongoose.model('Bid', bidSchema);
