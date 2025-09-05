const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// 🎨 Beautiful utilities
const ResponseHelper = require("../utils/responseHelper");
const Logger = require("../utils/logger");
const ValidationHelper = require("../utils/validationHelper");

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
      registrationNumber,
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

    // Required field checks
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (role === "user" && !name) {
      return res.status(400).json({ message: "Name is required for users" });
    }

    if (role === "logistics" && !registrationNumber) {
      return res.status(400).json({
        message: "Registration number is required for logistics users",
      });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database not available. Please check your MongoDB connection.",
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

    // Base user data
    const userData = {
      name: name || "",
      email,
      password: hashedPassword,
      role,
      phoneNumber: phoneNumber || "",
    };

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
    }

    // Save user
    const user = await User.create(userData);

    // Prepare response
    let responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profilePicture: normalizePath(user.profilePicture),
      accessToken: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    };

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
        isVerified: user.isVerified,
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
        message: "Database not available. Please check your MongoDB connection.",
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

    // Don’t leak password
    user.password = undefined;

    let responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profilePicture: normalizePath(user.profilePicture),
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
      if (err) return res.status(403).json({ message: "Invalid refresh token" });
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
        user.documents.governmentId = normalizePath(user.documents.governmentId);
    }

    res.json(user);
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

    if (req.files?.profilePicture?.[0]) {
      user.profilePicture = normalizePath(req.files.profilePicture[0].path);
    }

    if (user.role === "logistics") {
      user.companyName = req.body.companyName || user.companyName;
      user.country = req.body.country || user.country;
      user.yearsInOperation = req.body.yearsInOperation || user.yearsInOperation;
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
    const userToReturn = await User.findById(updatedUser._id).select("-password");

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
      _id: userToReturn._id,
      name: userToReturn.name,
      email: userToReturn.email,
      role: userToReturn.role,
      phoneNumber: userToReturn.phoneNumber,
      profilePicture: userToReturn.profilePicture,
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
      accessToken: generateAccessToken(updatedUser._id),
      refreshToken: generateRefreshToken(updatedUser._id),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateProfile,
};
