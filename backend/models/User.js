const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Common Fields
    name: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
      default: "",
    },
    // Online Status
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "logistics", "admin"],
      required: true,
    },
    verified: { type: Boolean, default: false },

    // User Profile Fields
    phoneNumber: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      default: "",
    },
    profilePicture: { type: String, default: "" },

    // Logistics Provider Fields
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: function () {
        return this.role === "logistics" ? "pending" : undefined;
      },
    },
    isVerified: { type: Boolean, default: false }, // Existing field, ensure consistency
    verificationNotes: { type: String, default: "" },

    companyName: {
      type: String,
      required: function () {
        return this.role === "logistics";
      },
      trim: true,
    },
    country: {
      type: String,
      required: function () {
        return this.role === "logistics";
      },
    },
    yearsInOperation: {
      type: Number,
      min: 0,
      required: function () {
        return this.role === "logistics";
      },
    },
    registrationNumber: {
      type: String,
      required: function () {
        return this.role === "logistics";
      },
      unique: true, // ✅ stays unique but only when provided
      sparse: true, // ✅ prevents multiple nulls from clashing
      trim: true,
    },
    companySize: {
      type: String,
      enum: ["small", "medium", "large"],
      required: function () {
        return this.role === "logistics";
      },
    },
    contactName: {
      type: String,
      required: function () {
        return this.role === "logistics";
      },
    },
    contactPosition: {
      type: String,
      required: function () {
        return this.role === "logistics";
      },
    },
    contactPhone: {
      type: String,
      required: function () {
        return this.role === "logistics";
      },
    },
    services: {
      type: [String],
      required: function () {
        return this.role === "logistics";
      },
    },
    regions: {
      type: [String],
      required: function () {
        return this.role === "logistics";
      },
    },
    fleetSize: {
      type: Number,
      min: 0,
      required: function () {
        return this.role === "logistics";
      },
    },
    website: {
      type: String,
      required: function () {
        return this.role === "logistics";
      },
    },

    // Documents
    documents: {
      businessLicense: { type: String, default: "" },
      insuranceCertificate: { type: String, default: "" },
      governmentId: { type: String, default: "" },
    },
    agreements: {
      type: Boolean,
      required: function () {
        return this.role === "logistics";
      },
      default: false,
    },
    terms: {
      type: Boolean,
      required: function () {
        return this.role === "logistics";
      },
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
