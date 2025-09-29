const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// 🎨 Beautiful utilities
const ResponseHelper = require("../utils/responseHelper");
const Logger = require("../utils/logger");
const ValidationHelper = require("../utils/validationHelper");
const {
  generateVerificationToken,
  generateVerificationCode,
  generateResetToken,
  sendVerificationEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail,
  sendNormalUserSignupEmail,
  sendLogisticsUserSignupEmail,
  sendLogisticsVerificationEmail,
  getEmailAnalytics,
} = require("../utils/emailService");

// ===== HELPERS =====

// Normalize file paths (Windows -> forward slashes)
const normalizePath = (p) => (p ? p.replace(/\\/g, "/") : p);

// Token generators
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Extended from 15m to 1h

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

// Parse fields that may come as JSON or comma-separated strings
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return field.split(",").map((s) => s.trim());
  }
};

// ===== REGISTER =====
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "user",
      phoneNumber,
      companyName,
      country,
      yearsInOperation,
      companySize,
      contactName,
      contactPosition,
      contactPhone,
      services,
      regions,
      fleetSize,
      website,
      agreements,
      terms,
    } = req.body;

    // Only destructure registrationNumber for logistics users
    let registrationNumber;
    if (role === "logistics") {
      registrationNumber = req.body.registrationNumber;
    }

    // Debug logging
    console.log("🔍 Registration debug:", {
      role,
      registrationNumber,
      registrationNumberType: typeof registrationNumber,
      registrationNumberEmpty: registrationNumber === "",
      registrationNumberNull: registrationNumber === null,
      registrationNumberUndefined: registrationNumber === undefined,
      hasRegistrationNumberInBody: "registrationNumber" in req.body,
      registrationNumberInBody: req.body.registrationNumber,
      fullRequestBody: req.body,
    });

    // Additional debugging for normal users
    if (role === "user") {
      console.log("🔍 NORMAL USER DEBUG:");
      console.log(
        "  - registrationNumber in req.body:",
        "registrationNumber" in req.body
      );
      console.log("  - registrationNumber value:", req.body.registrationNumber);
      console.log("  - All req.body keys:", Object.keys(req.body));

      // Safety check: remove ALL logistics fields from req.body for normal users
      const logisticsFields = [
        "registrationNumber",
        "companyName",
        "yearsInOperation",
        "companySize",
        "contactName",
        "contactEmail",
        "contactPosition",
        "contactPhone",
        "services",
        "regions",
        "fleetSize",
        "website",
        "agreements",
        "terms",
      ];

      logisticsFields.forEach((field) => {
        if (field in req.body) {
          console.log(
            `🔧 BACKEND SAFETY: Removing ${field} from req.body for normal user`
          );
          delete req.body[field];
        }
      });
    }

    // Required field checks
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Only require name and phoneNumber for non-logistics users
    if (role !== "logistics") {
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      // Country is optional for normal users
    }

    if (
      role === "logistics" &&
      (!registrationNumber || registrationNumber.trim() === "")
    ) {
      return res.status(400).json({
        message: "Registration number is required for logistics users",
      });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          "Database not available. Please check your MongoDB connection.",
        fallback: true,
      });
    }

    // Ensure unique email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Base user data
    const userData = {
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    };

    // Add name and phoneNumber for non-logistics users
    if (role !== "logistics") {
      userData.name = name || "";
      userData.phoneNumber = phoneNumber || "";
      // Country is optional for normal users
      if (country) {
        userData.country = country;
      }
    }

    // Add logistics-specific fields
    if (role === "logistics") {
      userData.companyName = companyName;
      userData.country = country;
      userData.yearsInOperation = yearsInOperation || 0;
      userData.registrationNumber = registrationNumber;
      userData.companySize = companySize;
      userData.contactName = contactName;
      userData.contactPosition = contactPosition;
      userData.contactPhone = contactPhone;
      userData.services = parseArrayField(services);
      userData.regions = parseArrayField(regions);
      userData.fleetSize = fleetSize || 0;
      userData.website = website || "";
      userData.agreements = agreements === "true" || agreements === true;
      userData.terms = terms === "true" || terms === true;

      userData.documents = {
        businessLicense: req.files?.businessLicense?.[0]?.path || "",
        insuranceCertificate: req.files?.insuranceCertificate?.[0]?.path || "",
        governmentId: req.files?.governmentId?.[0]?.path || "",
      };
    } else {
      // For normal users, explicitly ensure registrationNumber is not included
      // This prevents any accidental inclusion that might cause unique constraint issues
      if (userData.hasOwnProperty("registrationNumber")) {
        delete userData.registrationNumber;
      }

      // Also check for any other logistics-specific fields that might cause issues
      const logisticsOnlyFields = [
        "companyName",
        "yearsInOperation",
        "registrationNumber",
        "companySize",
        "contactName",
        "contactPosition",
        "contactPhone",
        "services",
        "regions",
        "fleetSize",
        "website",
        "agreements",
        "terms",
      ];

      logisticsOnlyFields.forEach((field) => {
        if (userData.hasOwnProperty(field)) {
          delete userData[field];
        }
      });
    }
    // Note: registrationNumber is only added for logistics users above
    // Normal users don't have this field, avoiding unique constraint issues

    // Final safety check: ensure registrationNumber is never included for normal users
    if (role !== "logistics" && "registrationNumber" in userData) {
      console.log(
        "🔧 FINAL SAFETY: Removing registrationNumber from userData for normal user"
      );
      delete userData.registrationNumber;
    }

    // CRITICAL: For normal users, explicitly ensure registrationNumber is undefined
    if (role !== "logistics") {
      userData.registrationNumber = undefined;
    }

    console.log("🔍 UserData before create:", {
      role: userData.role,
      hasRegistrationNumber: "registrationNumber" in userData,
      registrationNumberValue: userData.registrationNumber,
      userDataKeys: Object.keys(userData),
    });

    // Save user with error handling for duplicate registration numbers
    let user;
    try {
      user = await User.create(userData);
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.registrationNumber) {
        console.log(
          "🔧 DUPLICATE REGISTRATION NUMBER: Attempting to clean up and retry..."
        );

        // Clean up any existing users with empty registration numbers
        await User.updateMany(
          { registrationNumber: "" },
          { $unset: { registrationNumber: 1 } }
        );

        // Retry creating the user
        user = await User.create(userData);
        console.log("✅ User created successfully after cleanup");
      } else {
        throw error; // Re-throw if it's not a duplicate registration number error
      }
    }

    // Send verification email
    try {
      console.log("📧 Attempting to send verification email to:", user.email);
      // Use appropriate name field based on user role
      const displayName =
        role === "logistics"
          ? user.contactName || user.companyName || "Logistics Partner"
          : user.name || "User";
      const emailResult = await sendVerificationEmail(
        user.email,
        verificationCode,
        displayName
      );
      if (emailResult.success) {
        console.log("✅ Verification email sent successfully to:", user.email);
      } else {
        console.error(
          "❌ Failed to send verification email:",
          emailResult.error
        );
        // Don't fail registration if email fails, just log it
      }
    } catch (emailError) {
      console.error("❌ Error sending verification email:", emailError.message);
      // Don't fail registration if email fails, just log it
    }

    // Note: Congratulatory emails will be sent after email verification

    // Create notifications for user registration
    try {
      console.log("📦 Creating notifications for user registration:", user._id);

      // 1. Notification for admin users about new registration
      const adminUsers = await User.find({ role: "admin" }).select("_id name");
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map((adminUser) => ({
          recipient: adminUser._id,
          type:
            role === "logistics"
              ? "new_logistics_registered"
              : "new_user_registered",
          title:
            role === "logistics"
              ? "New Logistics Registration"
              : "New User Registration",
          message: `A new ${role} user "${displayName}" has registered and ${
            role === "logistics"
              ? "requires verification"
              : "is ready to use the platform"
          }.`,
          priority: role === "logistics" ? "high" : "medium",
          relatedEntity: {
            type: "user",
            id: user._id,
          },
          metadata: {
            userId: user._id,
            userName: displayName,
            userRole: role,
            userEmail: user.email,
            registeredAt: new Date(),
            needsVerification: role === "logistics",
          },
          actions: [
            {
              label: role === "logistics" ? "Review Application" : "View User",
              action: "view",
              url:
                role === "logistics"
                  ? `/admin/logistics/${user._id}`
                  : `/admin/users/${user._id}`,
              method: "GET",
            },
          ],
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log("✅ Admin notifications created for user registration");
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating registration notifications:",
        notificationError
      );
      // Don't fail registration if notification creation fails
    }

    // Prepare response
    let responseData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      profilePicture: normalizePath(user.profilePicture),
      isVerified: user.isVerified,
      message:
        "Registration successful! Please check your email to verify your account.",
      needsVerification: true, // Add this flag for frontend
      // Don't send tokens until email is verified
      // accessToken: generateAccessToken(user._id),
      // refreshToken: generateRefreshToken(user._id),
    };

    // Add name, phoneNumber, and country for non-logistics users
    if (user.role !== "logistics") {
      responseData.name = user.name;
      responseData.phoneNumber = user.phoneNumber;
      responseData.country = user.country;
    }

    if (user.role === "logistics") {
      responseData = {
        ...responseData,
        companyName: user.companyName,
        country: user.country,
        yearsInOperation: user.yearsInOperation,
        registrationNumber: user.registrationNumber,
        companySize: user.companySize,
        contactName: user.contactName,
        contactPosition: user.contactPosition,
        contactPhone: user.contactPhone,
        services: user.services,
        regions: user.regions,
        fleetSize: user.fleetSize,
        website: user.website,
        verificationStatus: user.verificationStatus,
      };
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Duplicate field detected: " + JSON.stringify(error.keyValue || {}),
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// ===== LOGIN =====
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // DB check
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          "Database not available. Please check your MongoDB connection.",
        fallback: true,
      });
    }

    // Explicitly select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Email verification check removed - users can now log in without verification

    // Don't leak password
    user.password = undefined;

    let responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profilePicture: normalizePath(user.profilePicture),
      profilePictureUrl: user.profilePictureUrl || "",
      profilePictureId: user.profilePictureId || "",
      accessToken: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    };

    if (user.role === "logistics") {
      responseData = {
        ...responseData,
        companyName: user.companyName || "",
        country: user.country || "",
        yearsInOperation: user.yearsInOperation || 0,
        registrationNumber: user.registrationNumber || "",
        companySize: user.companySize || "",
        contactName: user.contactName || "",
        contactPosition: user.contactPosition || "",
        contactPhone: user.contactPhone || "",
        services: user.services || [],
        regions: user.regions || [],
        fleetSize: user.fleetSize || 0,
        website: user.website || "",
        verificationStatus: user.verificationStatus || "pending",
        isVerified: user.isVerified || false,
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// ===== REFRESH TOKEN =====
const refreshAccessToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(401).json({ message: "Refresh token required" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });
      const accessToken = generateAccessToken(decoded.id);
      res.json({ accessToken });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// ===== GET PROFILE =====
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePicture)
      user.profilePicture = normalizePath(user.profilePicture);
    if (user.documents) {
      if (user.documents.businessLicense)
        user.documents.businessLicense = normalizePath(
          user.documents.businessLicense
        );
      if (user.documents.insuranceCertificate)
        user.documents.insuranceCertificate = normalizePath(
          user.documents.insuranceCertificate
        );
      if (user.documents.governmentId)
        user.documents.governmentId = normalizePath(
          user.documents.governmentId
        );
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        profilePictureUrl: user.profilePictureUrl || "",
        profilePictureId: user.profilePictureId || "",
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ===== UPDATE PROFILE =====
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle password change
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({
          message: "Current password is required to change password",
        });
      }

      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect current password" });
      }
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    // Update general fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.bio = req.body.bio || user.bio;

    if (req.files?.profilePicture?.[0]) {
      user.profilePicture = normalizePath(req.files.profilePicture[0].path);
    }

    if (user.role === "logistics") {
      user.companyName = req.body.companyName || user.companyName;
      user.country = req.body.country || user.country;
      user.yearsInOperation =
        req.body.yearsInOperation || user.yearsInOperation;
      user.registrationNumber =
        req.body.registrationNumber || user.registrationNumber;
      user.companySize = req.body.companySize || user.companySize;
      user.contactName = req.body.contactName || user.contactName;
      user.contactPosition = req.body.contactPosition || user.contactPosition;
      user.contactPhone = req.body.contactPhone || user.contactPhone;
      user.services = req.body.services
        ? parseArrayField(req.body.services)
        : user.services;
      user.regions = req.body.regions
        ? parseArrayField(req.body.regions)
        : user.regions;
      user.fleetSize = req.body.fleetSize || user.fleetSize;
      user.website = req.body.website || user.website;

      if (req.files) {
        user.documents = {
          businessLicense: req.files?.businessLicense?.[0]?.path
            ? normalizePath(req.files.businessLicense[0].path)
            : user.documents?.businessLicense,
          insuranceCertificate: req.files?.insuranceCertificate?.[0]?.path
            ? normalizePath(req.files.insuranceCertificate[0].path)
            : user.documents?.insuranceCertificate,
          governmentId: req.files?.governmentId?.[0]?.path
            ? normalizePath(req.files.governmentId[0].path)
            : user.documents?.governmentId,
        };
      }
    }

    const updatedUser = await user.save();
    const userToReturn = await User.findById(updatedUser._id).select(
      "-password"
    );

    if (userToReturn.profilePicture)
      userToReturn.profilePicture = normalizePath(userToReturn.profilePicture);
    if (userToReturn.documents) {
      if (userToReturn.documents.businessLicense)
        userToReturn.documents.businessLicense = normalizePath(
          userToReturn.documents.businessLicense
        );
      if (userToReturn.documents.insuranceCertificate)
        userToReturn.documents.insuranceCertificate = normalizePath(
          userToReturn.documents.insuranceCertificate
        );
      if (userToReturn.documents.governmentId)
        userToReturn.documents.governmentId = normalizePath(
          userToReturn.documents.governmentId
        );
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: userToReturn._id,
        name: userToReturn.name,
        email: userToReturn.email,
        role: userToReturn.role,
        phoneNumber: userToReturn.phoneNumber,
        phone: userToReturn.phone,
        address: userToReturn.address,
        bio: userToReturn.bio,
        profilePicture: userToReturn.profilePicture,
        profilePictureUrl: userToReturn.profilePictureUrl || "",
        profilePictureId: userToReturn.profilePictureId || "",
        companyName: userToReturn.companyName,
        country: userToReturn.country,
        yearsInOperation: userToReturn.yearsInOperation,
        registrationNumber: userToReturn.registrationNumber,
        companySize: userToReturn.companySize,
        contactName: userToReturn.contactName,
        contactPosition: userToReturn.contactPosition,
        contactPhone: userToReturn.contactPhone,
        services: userToReturn.services,
        regions: userToReturn.regions,
        fleetSize: userToReturn.fleetSize,
        website: userToReturn.website,
        documents: userToReturn.documents,
      },
      accessToken: generateAccessToken(updatedUser._id),
      refreshToken: generateRefreshToken(updatedUser._id),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ===== VERIFY EMAIL =====
const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Verification code is required",
        code: "CODE_REQUIRED",
      });
    }

    // Code format validation (should be 6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        message:
          "Invalid verification code format. Please enter a 6-digit code.",
        code: "INVALID_CODE_FORMAT",
      });
    }

    // Find user with the verification code
    const user = await User.findOne({
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }, // Code not expired
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired verification code. Please request a new verification email.",
        code: "INVALID_OR_EXPIRED_CODE",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        code: "ALREADY_VERIFIED",
        isVerified: true,
      });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Log successful verification
    console.log(`✅ Email verified successfully for user: ${user.email}`);

    // Send congratulatory verification email based on user role
    try {
      console.log(
        "📧 Attempting to send congratulatory verification email to:",
        user.email
      );
      let congratulatoryEmailResult;

      if (user.role === "logistics") {
        const companyName = user.companyName || "Logistics Partner";
        congratulatoryEmailResult = await sendLogisticsVerificationEmail(
          user.email,
          companyName
        );
      } else {
        const userName = user.name || "User";
        congratulatoryEmailResult = await sendNormalUserSignupEmail(
          user.email,
          userName
        );
      }

      if (congratulatoryEmailResult.success) {
        console.log(
          "✅ Congratulatory verification email sent successfully to:",
          user.email
        );
      } else {
        console.error(
          "❌ Failed to send congratulatory verification email:",
          congratulatoryEmailResult.error
        );
        // Don't fail verification if email fails, just log it
      }
    } catch (congratulatoryEmailError) {
      console.error(
        "❌ Error sending congratulatory verification email:",
        congratulatoryEmailError.message
      );
      // Don't fail verification if email fails, just log it
    }

    res.json({
      message:
        "Email verified successfully! You can now log in to your account.",
      isVerified: true,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
};

// ===== RESEND VERIFICATION EMAIL =====
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Enhanced validation
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        field: "email",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        field: "email",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        isVerified: true,
        code: "ALREADY_VERIFIED",
      });
    }

    // Check if code is still valid (not expired)
    const now = new Date();
    if (
      user.verificationCode &&
      user.verificationCodeExpires &&
      user.verificationCodeExpires > now
    ) {
      const timeLeft = Math.ceil(
        (user.verificationCodeExpires - now) / (1000 * 60)
      ); // minutes
      return res.status(429).json({
        message: `Please wait ${timeLeft} minutes before requesting a new verification email`,
        code: "TOO_MANY_REQUESTS",
        retryAfter: timeLeft,
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send verification email
    try {
      // Use appropriate name field based on user role
      const displayName =
        user.role === "logistics"
          ? user.contactName || user.companyName || "Logistics Partner"
          : user.name || "User";
      const emailResult = await sendResendVerificationEmail(
        user.email,
        verificationCode,
        displayName
      );
      if (!emailResult.success) {
        console.error(
          "Failed to send resend verification email:",
          emailResult.error
        );
        return res.status(500).json({
          message: "Failed to send verification email. Please try again later.",
          code: "EMAIL_SEND_FAILED",
        });
      }
    } catch (emailError) {
      console.error("Error sending resend verification email:", emailError);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    res.json({
      message: "Verification email sent successfully! Please check your email.",
      email: user.email,
      expiresIn: "24 hours",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
};

// ===== CHECK VERIFICATION STATUS =====
const checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email parameter is required",
        field: "email",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        field: "email",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select(
      "email isVerified verificationCodeExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
        code: "USER_NOT_FOUND",
      });
    }

    const now = new Date();
    const hasValidCode =
      user.verificationCodeExpires && user.verificationCodeExpires > now;
    const timeLeft = hasValidCode
      ? Math.ceil((user.verificationCodeExpires - now) / (1000 * 60))
      : 0;

    res.json({
      email: user.email,
      isVerified: user.isVerified,
      hasValidCode,
      timeLeft: timeLeft > 0 ? `${timeLeft} minutes` : null,
      canResend: !hasValidCode || timeLeft <= 0,
    });
  } catch (error) {
    console.error("Check verification status error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
};

// ===== EMAIL ANALYTICS =====
const getEmailAnalyticsData = async (req, res) => {
  try {
    // Only allow admin users to access analytics
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        code: "ADMIN_REQUIRED",
      });
    }

    const analytics = getEmailAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error("Get email analytics error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
};

// ===== FORGOT PASSWORD =====
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Enhanced validation
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        field: "email",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        field: "email",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        message:
          "If an account with that email exists, we've sent a password reset link.",
        email: email,
      });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    const resetCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset code
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpires = resetCodeExpires;
    await user.save();

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(
        user.email,
        resetCode,
        user.name
      );
      if (!emailResult.success) {
        console.error(
          "Failed to send password reset email:",
          emailResult.error
        );
        return res.status(500).json({
          message:
            "Failed to send password reset email. Please try again later.",
          code: "EMAIL_SEND_FAILED",
        });
      }
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
        code: "EMAIL_SEND_FAILED",
      });
    }

    res.json({
      message:
        "If an account with that email exists, we've sent a password reset link.",
      email: user.email,
      expiresIn: "1 hour",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
};

// ===== VALIDATE RESET CODE =====
const validateResetCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Reset code is required",
        code: "CODE_REQUIRED",
      });
    }

    // Code format validation (should be 6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        message: "Invalid reset code format. Please enter a 6-digit code.",
        code: "INVALID_CODE_FORMAT",
      });
    }

    // Find user with the reset code
    const user = await User.findOne({
      resetPasswordCode: code,
      resetPasswordCodeExpires: { $gt: Date.now() }, // Code not expired
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired reset code. Please request a new password reset.",
        code: "INVALID_OR_EXPIRED_CODE",
      });
    }

    res.json({
      message: "Reset code is valid",
      success: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Validate reset code error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
};

// ===== RESET PASSWORD =====
const resetPassword = async (req, res) => {
  try {
    const { code, password, confirmPassword } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({
        message: "Reset code is required",
        code: "CODE_REQUIRED",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password are required",
        fields: ["password", "confirmPassword"],
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        field: "confirmPassword",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        field: "password",
      });
    }

    // Code format validation (should be 6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        message: "Invalid reset code format. Please enter a 6-digit code.",
        code: "INVALID_CODE_FORMAT",
      });
    }

    // Find user with the reset code
    const user = await User.findOne({
      resetPasswordCode: code,
      resetPasswordCodeExpires: { $gt: Date.now() }, // Code not expired
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired reset code. Please request a new password reset.",
        code: "INVALID_OR_EXPIRED_CODE",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset code
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();

    // Log successful password reset
    console.log(`✅ Password reset successfully for user: ${user.email}`);

    res.json({
      message:
        "Password reset successfully! You can now log in with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    });
  }
};

// Upload profile picture function removed - now handled by profileController.js

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user first to check if they have a profile picture
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the actual file from disk if it exists
    if (user.profilePicture) {
      const fs = require("fs");
      const path = require("path");
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profiles",
        user.profilePicture
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`✅ Deleted profile picture file: ${imagePath}`);
      }
    }

    // Update user to remove profile picture from database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { profilePicture: 1 } },
      { new: true }
    ).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires"
    );

    res.json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile picture deletion",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  checkVerificationStatus,
  getEmailAnalyticsData,
  forgotPassword,
  validateResetCode,
  resetPassword,
  deleteProfilePicture,
};
