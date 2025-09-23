const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

// Debug route to test authentication
router.get("/auth-test", protect, (req, res) => {
  res.json({
    success: true,
    message: "Authentication successful",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Debug route to check token without authentication
router.get("/token-check", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer") ? authHeader.split(" ")[1] : null;
  
  res.json({
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 20) + "..." : null
  });
});

// Debug route to check database connectivity
// router.get("/db-status", (req, res) => {
//   const mongoose = require('mongoose');
//   const connectionState = mongoose.connection.readyState;
//   const stateNames = {
//     0: 'disconnected',
//     1: 'connected',
//     2: 'connecting',
//     3: 'disconnecting'
//   };
  
//   res.json({
//     databaseStatus: stateNames[connectionState] || 'unknown',
//     connectionState: connectionState,
//     isConnected: connectionState === 1,
//     mongoUri: process.env.MONGODB_URI ? 'configured' : 'not configured',
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// Debug route to check shipments in database
router.get("/shipments-count", async (req, res) => {
  try {
    const Shipment = require('../models/Shipment');
    const User = require('../models/User');
    
    const totalShipments = await Shipment.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get a sample of shipments
    const sampleShipments = await Shipment.find().limit(5).select('shipmentTitle status user createdAt');
    
    res.json({
      totalShipments,
      totalUsers,
      sampleShipments,
      databaseConnected: true
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      databaseConnected: false
    });
  }
});

// Debug route to check bids in database
router.get("/bids-count", async (req, res) => {
  try {
    const Bid = require('../models/Bid');
    const Shipment = require('../models/Shipment');
    const User = require('../models/User');
    
    const totalBids = await Bid.countDocuments();
    const totalShipments = await Shipment.countDocuments();
    const logisticsUsers = await User.countDocuments({ role: 'logistics' });
    const openShipments = await Shipment.countDocuments({ status: 'open' });
    
    // Get a sample of bids
    const sampleBids = await Bid.find()
      .populate('carrier', 'name email role companyName')
      .populate('shipment', 'shipmentTitle status user')
      .limit(5)
      .sort({ createdAt: -1 });
    
    res.json({
      totalBids,
      totalShipments,
      logisticsUsers,
      openShipments,
      sampleBids,
      databaseConnected: true
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      databaseConnected: false
    });
  }
});

module.exports = router;