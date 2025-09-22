const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Common Fields
    name: {
      type: String,
      required: function () {
        return this.role !== "logistics";
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
    verificationToken: { type: String, default: "" },
    verificationTokenExpires: { type: Date, default: null },
    verificationCode: { type: String, default: "" },
    verificationCodeExpires: { type: Date, default: null },

    // Password Reset Fields
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date, default: null },
    resetPasswordCode: { type: String, default: "" },
    resetPasswordCodeExpires: { type: Date, default: null },

    // User Profile Fields
    phoneNumber: {
      type: String,
      required: function () {
        return this.role !== "logistics";
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
      required: true,
      default: "",
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
      enum: ["small", "medium", "large", "enterprise"],
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

    // Additional Profile Fields
    phone: { type: String, default: "" },
    country: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    website: { type: String, default: "" },
    yearsInOperation: { type: String, default: "" },
    companySize: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },

    // User Preferences
    preferences: {
      theme: { type: String, default: "light" },
      currency: { type: String, default: "USD" },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
    },

    // Notification Preferences
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      security: { type: Boolean, default: true },
      updates: { type: Boolean, default: true },
    },

    // Privacy Settings
    privacySettings: {
      profileVisibility: { type: String, default: "public" },
      showEmail: { type: Boolean, default: true },
      showPhone: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
    },

    // Account Status
    isActive: { type: Boolean, default: true },
    suspensionEndDate: { type: Date, default: null },
    suspensionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Pre-save hook to handle empty registration numbers
userSchema.pre("save", function (next) {
  // If registrationNumber is an empty string and user is not logistics, set it to undefined
  if (this.role !== "logistics" && this.registrationNumber === "") {
    this.registrationNumber = undefined;
  }
  next();
});

// Indexes
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
