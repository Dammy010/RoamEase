const Shipment = require('../models/Shipment');
const { getIO } = require('../socket'); // New: Import getIO to access Socket.io instance
const NotificationService = require('../services/notificationService');
const User = require('../models/User');

const parseNumber = (val) =>
  val !== undefined && val !== "" && !isNaN(val) ? Number(val) : undefined;

const parseDate = (val) => (val ? new Date(val) : undefined);

// Create a new shipment
const createShipment = async (req, res) => {
  try {
    const data = req.body;

    // Debug: Log the incoming data to see what's being received
    console.log('📦 Creating shipment with data:', {
      shipmentTitle: data.shipmentTitle,
      pickupCity: data.pickupCity,
      pickupCountry: data.pickupCountry,
      deliveryCity: data.deliveryCity,
      deliveryCountry: data.deliveryCountry,
      user: req.user._id
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.photos) data.photos = req.files.photos.map((f) => f.path);
      if (req.files.documents) data.documents = req.files.documents.map((f) => f.path);
    }

    // Convert numeric fields
    ["weight", "length", "width", "height", "quantity"].forEach((k) => {
      data[k] = parseNumber(data[k]);
    });

    // Convert date fields
    ["preferredPickupDate", "preferredDeliveryDate"].forEach((k) => {
      data[k] = parseDate(data[k]);
    });

    const shipment = await Shipment.create({ ...data, user: req.user._id });
    const populatedShipment = await shipment.populate('user', 'name email companyName country'); // Populate for emitting

    // Debug: Log the created shipment to see what was saved
    console.log('📦 Created shipment:', {
      _id: shipment._id,
      shipmentTitle: shipment.shipmentTitle,
      pickupCity: shipment.pickupCity,
      pickupCountry: shipment.pickupCountry,
      deliveryCity: shipment.deliveryCity,
      deliveryCountry: shipment.deliveryCountry
    });

    const io = getIO();
    io.emit('new-shipment', populatedShipment); // Emit new shipment event to all connected clients

    // Create notifications for shipment creation
    try {
      console.log('📦 Creating notifications for new shipment:', shipment._id);
      
      // 1. Notification for the user who created the shipment
      const userNotificationData = {
        recipient: req.user._id,
        type: 'shipment_created',
        title: 'Shipment Created Successfully',
        message: `Your shipment "${shipment.shipmentTitle}" has been created and is now available for logistics providers to bid on.`,
        priority: 'medium',
        relatedEntity: {
          type: 'shipment',
          id: shipment._id
        },
        metadata: {
          shipmentId: shipment._id,
          shipmentTitle: shipment.shipmentTitle,
          pickupCity: shipment.pickupCity,
          pickupCountry: shipment.pickupCountry,
          deliveryCity: shipment.deliveryCity,
          deliveryCountry: shipment.deliveryCountry,
          estimatedValue: shipment.estimatedValue
        },
        actions: [
          {
            label: 'View Shipment',
            action: 'view',
            url: `/shipments/${shipment._id}`,
            method: 'GET'
          }
        ]
      };

      await NotificationService.createNotification(userNotificationData);
      console.log('✅ User notification created for shipment creation');

      // 2. Notifications for all logistics providers
      const logisticsUsers = await User.find({ role: 'logistics', isVerified: true }).select('_id name companyName');
      console.log(`📋 Found ${logisticsUsers.length} verified logistics providers`);

      if (logisticsUsers.length > 0) {
        // Debug: Log shipment data to see what's available
        console.log('🔍 Shipment data for notification:', {
          shipmentTitle: shipment.shipmentTitle,
          pickupCity: shipment.pickupCity,
          pickupCountry: shipment.pickupCountry,
          deliveryCity: shipment.deliveryCity,
          deliveryCountry: shipment.deliveryCountry
        });

        const logisticsNotifications = logisticsUsers.map(logisticsUser => {
          // Create safe fallback values
          const pickupLocation = shipment.pickupCity && shipment.pickupCountry 
            ? `${shipment.pickupCity}, ${shipment.pickupCountry}`
            : shipment.pickupCity || shipment.pickupCountry || 'Location not specified';
          
          const deliveryLocation = shipment.deliveryCity && shipment.deliveryCountry 
            ? `${shipment.deliveryCity}, ${shipment.deliveryCountry}`
            : shipment.deliveryCity || shipment.deliveryCountry || 'Location not specified';

          return {
            recipient: logisticsUser._id,
            type: 'new_shipment_available',
            title: 'New Shipment Available',
            message: `A new shipment "${shipment.shipmentTitle}" from ${pickupLocation} to ${deliveryLocation} is now available for bidding.`,
            priority: 'high',
            relatedEntity: {
              type: 'shipment',
              id: shipment._id
            },
            metadata: {
              shipmentId: shipment._id,
              shipmentTitle: shipment.shipmentTitle,
              pickupCity: shipment.pickupCity || 'Not specified',
              pickupCountry: shipment.pickupCountry || 'Not specified',
              deliveryCity: shipment.deliveryCity || 'Not specified',
              deliveryCountry: shipment.deliveryCountry || 'Not specified',
              estimatedValue: shipment.estimatedValue,
              preferredPickupDate: shipment.preferredPickupDate,
              preferredDeliveryDate: shipment.preferredDeliveryDate,
              createdBy: req.user._id,
              createdByName: req.user.name || req.user.companyName
            },
            actions: [
              {
                label: 'View Shipment',
                action: 'view',
                url: `/shipments/${shipment._id}`,
                method: 'GET'
              },
              {
                label: 'Place Bid',
                action: 'bid',
                url: `/shipments/${shipment._id}/bid`,
                method: 'GET'
              }
            ]
          };
        });

        await NotificationService.createBulkNotifications(logisticsNotifications);
        console.log(`✅ Created ${logisticsNotifications.length} notifications for logistics providers`);
      }

      // 3. Notification for admin users
      const adminUsers = await User.find({ role: 'admin' }).select('_id name');
      console.log(`📋 Found ${adminUsers.length} admin users`);

      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(adminUser => ({
          recipient: adminUser._id,
          type: 'shipment_created',
          title: 'New Shipment Created',
          message: `A new shipment "${shipment.shipmentTitle}" has been created by ${req.user.name || req.user.companyName}.`,
          priority: 'medium',
          relatedEntity: {
            type: 'shipment',
            id: shipment._id
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            fromLocation: shipment.fromLocation,
            toLocation: shipment.toLocation,
            estimatedValue: shipment.estimatedValue,
            createdBy: req.user._id,
            createdByName: req.user.name || req.user.companyName
          },
          actions: [
            {
              label: 'View Shipment',
              action: 'view',
              url: `/admin/shipments/${shipment._id}`,
              method: 'GET'
            }
          ]
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log(`✅ Created ${adminNotifications.length} notifications for admin users`);
      }

    } catch (notificationError) {
      console.error('❌ Error creating shipment notifications:', notificationError);
      // Don't fail the shipment creation if notification creation fails
    }

    return res.status(201).json({
      success: true,
      shipment: populatedShipment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error creating shipment",
      error: err.message,
    });
  }
};

// Fetch all shipments for logged-in user
const getShipments = async (req, res) => {
  try {
    console.log("DEBUG: getShipments - User ID:", req.user._id); // Log the user ID
    const query = {
      user: req.user._id,
      status: { $in: ['open', 'accepted'] } // Fetch only 'open' and 'accepted' shipments
    };
    console.log("DEBUG: getShipments - Query:", query); // Log the query

    const shipments = await Shipment.find(query).sort({
      createdAt: -1,
    });
    console.log("DEBUG: getShipments - Shipments found:", shipments.length); // Log number of shipments
    // console.log("DEBUG: getShipments - Shipments data:", shipments); // Log actual shipment data (use with caution for large data)

    return res.json({
      success: true,
      shipments,
    });
  } catch (err) {
    console.error("ERROR: getShipments - Error fetching shipments:", err); // Log the error
    return res.status(500).json({
      success: false,
      message: "Error fetching shipments",
      error: err.message,
    });
  }
};

// ✅ Fetch shipment history (delivered, received, or returned)
const getShipmentHistory = async (req, res) => {
  try {
    const history = await Shipment.find({
      user: req.user._id,
      status: { $in: ["completed", "delivered", "received", "returned"] },
    }).sort({ updatedAt: -1 });

    return res.json({
      success: true,
      history,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching shipment history",
      error: err.message,
    });
  }
};

// Fetch single shipment by ID
const getShipmentById = async (req, res) => {
  try {
    console.log("DEBUG: getShipmentById - Requesting shipment with ID:", req.params.id);
    const shipment = await Shipment.findById(req.params.id);
    console.log("DEBUG: getShipmentById - Result of findById:", shipment);
    if (!shipment) {
      console.log("DEBUG: getShipmentById - Shipment not found for ID:", req.params.id);
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }
    console.log("DEBUG: getShipmentById - Sending shipment data:", shipment);
    return res.json({ success: true, shipment });
  } catch (err) {
    console.error("ERROR: getShipmentById - Error fetching shipment:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching shipment",
      error: err.message,
    });
  }
};

// Update shipment status
const updateShipmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ["open", "accepted", "completed", "delivered", "returned"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    const populatedShipment = await shipment.populate('user', 'name email companyName country'); // Populate for emitting
    const io = getIO();
    io.emit('shipment-updated', populatedShipment); // Emit shipment updated event

    return res.json({ success: true, shipment: populatedShipment });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating status",
      error: err.message,
    });
  }
};

// New: Fetch open shipments not created by the current user (for carriers to bid on)
const getAvailableShipmentsForCarrier = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      status: 'open',
      user: { $ne: req.user._id } // Exclude shipments created by the current user
    })
      .populate('user', 'name email companyName country phone') // Populate comprehensive user details
      .sort({ createdAt: -1 });

    // Transform shipments to include full details and formatted data
    const enhancedShipments = shipments.map(shipment => {
      const shipmentObj = shipment.toObject();
      
      // Add formatted dates
      shipmentObj.formattedPickupDate = shipment.preferredPickupDate 
        ? new Date(shipment.preferredPickupDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Not specified';
      
      shipmentObj.formattedDeliveryDate = shipment.preferredDeliveryDate
        ? new Date(shipment.preferredDeliveryDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Not specified';
      
      shipmentObj.formattedCreatedDate = new Date(shipment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Add dimensions summary
      if (shipment.length && shipment.width && shipment.height) {
        shipmentObj.dimensions = `${shipment.length}L × ${shipment.width}W × ${shipment.height}H`;
      }

      // Add weight summary
      if (shipment.weight) {
        shipmentObj.weightSummary = `${shipment.weight} kg`;
      }

      // Add quantity summary
      shipmentObj.quantitySummary = shipment.quantity > 1 ? `${shipment.quantity} items` : '1 item';

      // Add pickup/delivery summary
      shipmentObj.routeSummary = `${shipment.pickupCity || shipment.pickupCountry} → ${shipment.deliveryCity || shipment.deliveryCountry}`;

      // Add urgency indicator (if pickup date is within 3 days)
      if (shipment.preferredPickupDate) {
        const pickupDate = new Date(shipment.preferredPickupDate);
        const today = new Date();
        const diffTime = pickupDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3 && diffDays >= 0) {
          shipmentObj.urgency = 'High';
          shipmentObj.urgencyColor = 'red';
        } else if (diffDays <= 7 && diffDays >= 0) {
          shipmentObj.urgency = 'Medium';
          shipmentObj.urgencyColor = 'orange';
        } else {
          shipmentObj.urgency = 'Normal';
          shipmentObj.urgencyColor = 'green';
        }
      }

      return shipmentObj;
    });

    return res.json({
      success: true,
      shipments: enhancedShipments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching available shipments for bidding',
      error: err.message,
    });
  }
};

// Public version for browsing open shipments without authentication
const getPublicOpenShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      status: 'open'
    })
      .populate('user', 'name email companyName country phone') // Populate comprehensive user details
      .sort({ createdAt: -1 });

    // Transform shipments to include full details and formatted data
    const enhancedShipments = shipments.map(shipment => {
      const shipmentObj = shipment.toObject();
      
      // Add formatted dates
      shipmentObj.formattedPickupDate = shipment.preferredPickupDate 
        ? new Date(shipment.preferredPickupDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Not specified';
      
      shipmentObj.formattedDeliveryDate = shipment.preferredDeliveryDate
        ? new Date(shipment.preferredDeliveryDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Not specified';
      
      shipmentObj.formattedCreatedDate = new Date(shipment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Add dimensions summary
      if (shipment.length && shipment.width && shipment.height) {
        shipmentObj.dimensions = `${shipment.length}L × ${shipment.width}W × ${shipment.height}H`;
      }

      // Add weight summary
      if (shipment.weight) {
        shipmentObj.weightSummary = `${shipment.weight} kg`;
      }

      // Add quantity summary
      shipmentObj.quantitySummary = shipment.quantity > 1 ? `${shipment.quantity} items` : '1 item';

      // Add pickup/delivery summary
      shipmentObj.routeSummary = `${shipment.pickupCity || shipment.pickupCountry} → ${shipment.deliveryCity || shipment.deliveryCountry}`;

      // Add urgency indicator (if pickup date is within 3 days)
      if (shipment.preferredPickupDate) {
        const pickupDate = new Date(shipment.preferredPickupDate);
        const today = new Date();
        const diffTime = pickupDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3 && diffDays >= 0) {
          shipmentObj.urgency = 'High';
          shipmentObj.urgencyColor = 'red';
        } else if (diffDays <= 7 && diffDays >= 0) {
          shipmentObj.urgency = 'Medium';
          shipmentObj.urgencyColor = 'orange';
        } else {
          shipmentObj.urgency = 'Normal';
          shipmentObj.urgencyColor = 'green';
        }
      }

      return shipmentObj;
    });

    return res.json({
      success: true,
      shipments: enhancedShipments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching open shipments',
      error: err.message,
    });
  }
};

// New: Mark shipment as delivered and add rating/feedback
const markAsDeliveredAndRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating is required and must be between 1 and 5." });
    }

    const shipment = await Shipment.findOne({ _id: id, user: req.user._id });

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found or unauthorized." });
    }

    // Only allow marking as delivered if status is 'accepted' or 'completed'
    if (shipment.status !== 'accepted' && shipment.status !== 'completed') {
      return res.status(400).json({ success: false, message: "Shipment must be accepted or completed before marking as delivered." });
    }

    // Update shipment fields
    shipment.status = 'delivered';
    shipment.deliveryDate = Date.now();
    shipment.rating = rating;
    shipment.feedback = feedback || '';

    await shipment.save();

    const populatedShipment = await shipment.populate('user', 'name email companyName country');
    const io = getIO();
    io.emit('shipment-updated', populatedShipment); // Emit shipment updated event

    return res.json({ success: true, message: "Shipment marked as delivered and rated.", shipment: populatedShipment });
  } catch (err) {
    console.error("ERROR: markAsDeliveredAndRate - Error marking shipment as delivered:", err);
    return res.status(500).json({ success: false, message: "Error marking shipment as delivered", error: err.message });
  }
};

// New: Mark shipment as delivered by logistics company
const markAsDeliveredByLogistics = async (req, res) => {
  try {
    const { id } = req.params;
    const logisticsCompanyId = req.user._id;
    
    // First, verify that this logistics company has an accepted bid for this shipment
    const Bid = require('../models/Bid');
    const acceptedBid = await Bid.findOne({
      shipment: id,
      carrier: logisticsCompanyId,
      status: 'accepted'
    });
    
    if (!acceptedBid) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to mark this shipment as delivered. Only logistics companies with accepted bids can mark shipments as delivered." 
      });
    }
    
    // Find shipment that this logistics company is handling
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found." });
    }

    // Check if shipment is in a state that can be marked as delivered
    if (shipment.status !== 'accepted' && shipment.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: "Shipment must be accepted or completed before marking as delivered." 
      });
    }

    // Update shipment fields
    shipment.status = 'delivered';
    shipment.deliveredByLogistics = logisticsCompanyId;
    shipment.deliveredAt = new Date();
    shipment.deliveryDate = new Date();
    shipment.awaitingUserConfirmation = true; // New: Flag to indicate user needs to confirm

    await shipment.save();

    // Populate user details for notification
    const populatedShipment = await shipment.populate('user', 'name email companyName country');
    
    // Emit socket event for real-time updates
    const io = getIO();
    io.emit('shipment-delivered-by-logistics', populatedShipment);
    
    // Emit specific event to the user
    io.emit(`user-${shipment.user._id}`, {
      type: 'shipment-delivered',
      message: `Your shipment "${shipment.shipmentTitle}" has been delivered by ${req.user.companyName || req.user.name}. Please confirm receipt.`,
      shipment: populatedShipment
    });

    // Create notifications for shipment delivery
    try {
      console.log('📦 Creating notifications for shipment delivery:', shipment._id);
      
      // 1. Notification for the user (shipment owner)
      const userNotificationData = {
        recipient: shipment.user._id,
        type: 'shipment_delivered',
        title: 'Shipment Delivered',
        message: `Your shipment "${shipment.shipmentTitle}" has been delivered by ${req.user.companyName || req.user.name}. Please confirm receipt.`,
        priority: 'high',
        relatedEntity: {
          type: 'shipment',
          id: shipment._id
        },
        metadata: {
          shipmentId: shipment._id,
          shipmentTitle: shipment.shipmentTitle,
          deliveredBy: req.user._id,
          deliveredByName: req.user.companyName || req.user.name,
          deliveredAt: shipment.deliveredAt
        },
        actions: [
          {
            label: 'Confirm Receipt',
            action: 'confirm',
            url: `/shipments/${shipment._id}/confirm`,
            method: 'POST'
          },
          {
            label: 'View Shipment',
            action: 'view',
            url: `/shipments/${shipment._id}`,
            method: 'GET'
          }
        ]
      };

      await NotificationService.createNotification(userNotificationData);
      console.log('✅ User notification created for shipment delivery');

      // 2. Notification for admin users
      const adminUsers = await User.find({ role: 'admin' }).select('_id name');
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(adminUser => ({
          recipient: adminUser._id,
          type: 'shipment_delivered',
          title: 'Shipment Delivered',
          message: `Shipment "${shipment.shipmentTitle}" has been delivered by ${req.user.companyName || req.user.name}.`,
          priority: 'medium',
          relatedEntity: {
            type: 'shipment',
            id: shipment._id
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            deliveredBy: req.user._id,
            deliveredByName: req.user.companyName || req.user.name,
            deliveredAt: shipment.deliveredAt,
            ownerId: shipment.user._id
          },
          actions: [
            {
              label: 'View Shipment',
              action: 'view',
              url: `/admin/shipments/${shipment._id}`,
              method: 'GET'
            }
          ]
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log(`✅ Created ${adminNotifications.length} notifications for admin users`);
      }

    } catch (notificationError) {
      console.error('❌ Error creating delivery notifications:', notificationError);
    }

    return res.json({ 
      success: true, 
      message: "Shipment marked as delivered by logistics company. User has been notified to confirm receipt.", 
      shipment: populatedShipment 
    });
  } catch (err) {
    console.error("ERROR: markAsDeliveredByLogistics - Error marking shipment as delivered:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Error marking shipment as delivered", 
      error: err.message 
    });
  }
};

// New: Mark shipment as received by user
const markAsReceivedByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find shipment that belongs to this user
    const shipment = await Shipment.findOne({ _id: id, user: userId });
    
    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: "Shipment not found or you don't have permission to mark it as received." 
      });
    }

    // Check if shipment is in 'delivered' status and awaiting user confirmation
    if (shipment.status !== 'delivered' || !shipment.awaitingUserConfirmation) {
      return res.status(400).json({ 
        success: false, 
        message: "Shipment must be delivered and awaiting confirmation before marking as received." 
      });
    }

    // Update shipment fields
    shipment.status = 'received';
    shipment.awaitingUserConfirmation = false;
    shipment.receivedAt = new Date();
    shipment.receivedByUser = userId;

    await shipment.save();

    // Populate logistics company details for notification
    const populatedShipment = await shipment.populate('deliveredByLogistics', 'name email companyName');
    
    // Emit socket event for real-time updates
    const io = getIO();
    io.emit('shipment-received-by-user', populatedShipment);
    
    // Emit specific event to the logistics company
    if (shipment.deliveredByLogistics) {
      io.emit(`user-${shipment.deliveredByLogistics._id}`, {
        type: 'shipment-received',
        message: `Your delivery of "${shipment.shipmentTitle}" has been confirmed by the user.`,
        shipment: populatedShipment
      });
    }

    // Create notifications for shipment receipt confirmation
    try {
      console.log('📦 Creating notifications for shipment receipt confirmation:', shipment._id);
      
      // 1. Notification for the logistics company
      if (shipment.deliveredByLogistics) {
        const logisticsNotificationData = {
          recipient: shipment.deliveredByLogistics._id,
          type: 'shipment_received',
          title: 'Delivery Confirmed',
          message: `Your delivery of "${shipment.shipmentTitle}" has been confirmed by the user. Great job!`,
          priority: 'high',
          relatedEntity: {
            type: 'shipment',
            id: shipment._id
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            receivedBy: userId,
            receivedAt: shipment.receivedAt,
            ownerName: req.user.name || req.user.companyName
          },
          actions: [
            {
              label: 'View Shipment',
              action: 'view',
              url: `/shipments/${shipment._id}`,
              method: 'GET'
            }
          ]
        };

        await NotificationService.createNotification(logisticsNotificationData);
        console.log('✅ Logistics notification created for shipment receipt confirmation');
      }

      // 2. Notification for admin users
      const adminUsers = await User.find({ role: 'admin' }).select('_id name');
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(adminUser => ({
          recipient: adminUser._id,
          type: 'shipment_received',
          title: 'Shipment Received',
          message: `Shipment "${shipment.shipmentTitle}" has been confirmed as received by the user.`,
          priority: 'medium',
          relatedEntity: {
            type: 'shipment',
            id: shipment._id
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            receivedBy: userId,
            receivedAt: shipment.receivedAt,
            deliveredBy: shipment.deliveredByLogistics,
            ownerName: req.user.name || req.user.companyName
          },
          actions: [
            {
              label: 'View Shipment',
              action: 'view',
              url: `/admin/shipments/${shipment._id}`,
              method: 'GET'
            }
          ]
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log(`✅ Created ${adminNotifications.length} notifications for admin users`);
      }

    } catch (notificationError) {
      console.error('❌ Error creating receipt confirmation notifications:', notificationError);
    }

    return res.json({ 
      success: true, 
      message: "Shipment marked as received. You can now rate the delivery service.", 
      shipment: populatedShipment 
    });
  } catch (err) {
    console.error("ERROR: markAsReceivedByUser - Error marking shipment as received:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Error marking shipment as received", 
      error: err.message 
    });
  }
};

// New: Get active shipments for logistics company (accepted bids)
const getActiveShipmentsForLogistics = async (req, res) => {
  try {
    console.log("DEBUG: getActiveShipmentsForLogistics - Request received");
    console.log("DEBUG: req.user:", req.user);
    console.log("DEBUG: req.user.role:", req.user?.role);
    console.log("DEBUG: req.user._id:", req.user?._id);
    
    const logisticsCompanyId = req.user._id;
    
    // First, find all accepted bids by this logistics company
    const Bid = require('../models/Bid');
    const acceptedBids = await Bid.find({
      carrier: logisticsCompanyId,
      status: 'accepted'
    }).populate('shipment');
    
    console.log("DEBUG: Found accepted bids:", acceptedBids.length);
    
    // Extract shipment IDs from accepted bids
    const shipmentIds = acceptedBids.map(bid => bid.shipment._id);
    console.log("DEBUG: Shipment IDs from bids:", shipmentIds);
    
    // Find shipments that this logistics company is handling
    const activeShipments = await Shipment.find({
      _id: { $in: shipmentIds },
      status: { $in: ['accepted', 'completed'] }
    }).populate('user', 'name email companyName country');
    
    console.log("DEBUG: Found active shipments:", activeShipments.length);
    
    // Format the response with actual bid information
    const formattedShipments = activeShipments.map(shipment => {
      // Find the corresponding bid for this shipment
      const bid = acceptedBids.find(b => b.shipment._id.toString() === shipment._id.toString());
      
      return {
        _id: shipment._id,
        shipmentTitle: shipment.shipmentTitle,
        status: shipment.status,
        pickupCity: shipment.pickupCity,
        deliveryCity: shipment.deliveryCity,
        pickupCountry: shipment.pickupCountry,
        deliveryCountry: shipment.deliveryCountry,
        typeOfGoods: shipment.typeOfGoods,
        weight: shipment.weight,
        quantity: shipment.quantity,
        modeOfTransport: shipment.modeOfTransport,
        preferredPickupDate: shipment.preferredPickupDate,
        preferredDeliveryDate: shipment.preferredDeliveryDate,
        user: shipment.user,
        // Use actual bid information
        acceptedBid: {
          price: bid ? bid.price : 0,
          eta: bid ? bid.eta : 'N/A',
          message: bid ? bid.message : ''
        }
      };
    });

    console.log("DEBUG: Returning formatted shipments:", formattedShipments.length);
    
    return res.json({
      success: true,
      shipments: formattedShipments,
    });
  } catch (err) {
    console.error("ERROR: getActiveShipmentsForLogistics - Error fetching active shipments:", err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching active shipments for logistics company',
      error: err.message,
    });
  }
};

// Delete a shipment (only by owner or admin)
const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the shipment
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }

    // Check if user is the owner or admin
    if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this shipment"
      });
    }

    // Check if shipment has accepted bids (prevent deletion if shipment is in progress)
    if (shipment.status === 'accepted' || shipment.status === 'in-transit' || shipment.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Cannot delete shipment that has been accepted or is in progress"
      });
    }

    // Delete the shipment
    await Shipment.findByIdAndDelete(id);

    // Emit deletion event to all connected clients
    const io = getIO();
    io.emit('shipment-deleted', { shipmentId: id });

    res.json({
      success: true,
      message: "Shipment deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting shipment",
      error: error.message
    });
  }
};

// Get logistics history (completed/delivered/received shipments)
const getLogisticsHistory = async (req, res) => {
  try {
    const logisticsCompanyId = req.user._id;
    
    // Find all bids made by this logistics company that are accepted
    const Bid = require('../models/Bid');
    const acceptedBids = await Bid.find({
      carrier: logisticsCompanyId,
      status: 'accepted'
    }).populate('shipment');
    
    // Get shipment IDs from accepted bids
    const shipmentIds = acceptedBids.map(bid => bid.shipment._id);
    
    // Find shipments that are completed, delivered, or received
    const history = await Shipment.find({
      _id: { $in: shipmentIds },
      status: { $in: ['completed', 'delivered', 'received'] }
    })
    .populate('user', 'name email companyName country phoneNumber')
    .sort({ updatedAt: -1 });
    
    // Add bid information to each shipment
    const historyWithBids = history.map(shipment => {
      const bid = acceptedBids.find(b => b.shipment._id.toString() === shipment._id.toString());
      return {
        ...shipment.toObject(),
        bid: bid ? {
          _id: bid._id,
          price: bid.price,
          eta: bid.eta,
          pickupDate: bid.pickupDate,
          message: bid.message,
          createdAt: bid.createdAt
        } : null
      };
    });
    
    res.json({
      success: true,
      history: historyWithBids,
      total: historyWithBids.length
    });
  } catch (err) {
    console.error("ERROR: getLogisticsHistory - Error fetching logistics history:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching logistics history",
      error: err.message
    });
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentHistory,
  getShipmentById,
  updateShipmentStatus,
  getAvailableShipmentsForCarrier,
  getPublicOpenShipments, // New: Export the public open shipments function
  markAsDeliveredAndRate,
  markAsDeliveredByLogistics,
  markAsReceivedByUser,
  getActiveShipmentsForLogistics, // New: Export the active shipments function
  deleteShipment, // New: Export the delete shipment function
  getLogisticsHistory, // New: Export the logistics history function
};
