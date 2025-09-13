const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Shipment Details
    shipmentTitle: { type: String, required: true },
    descriptionOfGoods: { type: String, required: true },

    // Goods Specifications
    typeOfGoods: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    weight: { type: Number, min: 0 },
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },

    // Pickup Information
    pickupAddress: String,
    pickupCity: String,
    pickupCountry: String,
    preferredPickupDate: Date,
    pickupContactPerson: String,
    pickupPhoneNumber: String,

    // Delivery Information
    deliveryAddress: String,
    deliveryCity: String,
    deliveryCountry: String,
    preferredDeliveryDate: Date,
    deliveryContactPerson: String,
    deliveryPhoneNumber: String,

    // Shipment Preferences
    modeOfTransport: { type: String, enum: ['Air', 'Sea', 'Road', 'Rail'] },
    insuranceRequired: { type: String, enum: ['Yes', 'No'], default: 'No' },
    handlingInstructions: String,

    // Attachments
    photos: [{ type: String }],
    documents: [{ type: String }],

    // Confirmation Flags
    confirmDetails: { type: Boolean, default: false },
    agreeToPolicy: { type: Boolean, default: false },

    // Status
    status: { type: String, enum: ['open', 'accepted', 'completed', 'delivered'], default: 'open' },
    deliveryDate: { type: Date }, // Date when the shipment was delivered
    rating: { type: Number, min: 1, max: 5 }, // User rating for the shipment (1-5 stars)
    feedback: { type: String }, // User feedback comments
    ratedAt: { type: Date }, // When the shipment was rated
    
    // Logistics Delivery Tracking
    deliveredByLogistics: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Logistics company that delivered
    deliveredAt: { type: Date }, // When logistics marked as delivered
    
    // User Delivery Confirmation
    awaitingUserConfirmation: { type: Boolean, default: false }, // Flag to indicate user needs to confirm delivery
    deliveredByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who confirmed delivery
    completedAt: { type: Date }, // When user confirmed delivery
    completedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who completed the delivery
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
