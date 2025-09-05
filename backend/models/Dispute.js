const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved"],
      default: "open",
    },
    adminNotes: String,
    resolution: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispute", disputeSchema);
