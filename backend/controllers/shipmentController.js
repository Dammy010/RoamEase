const Shipment = require("../models/Shipment");
const Bid = require("../models/Bid");
const { getIO } = require("../socket"); // New: Import getIO to access Socket.io instance
const NotificationService = require("../services/notificationService");
const User = require("../models/User");
const axios = require("axios"); // For reverse geocoding

const parseNumber = (val) =>
  val !== undefined && val !== "" && !isNaN(val) ? Number(val) : undefined;

const parseDate = (val) => (val ? new Date(val) : undefined);

// Create a new shipment
const createShipment = async (req, res) => {
  try {
    const data = req.body;

    // Debug: Log the incoming data to see what's being received
    console.log("📦 Creating shipment with data:", {
      shipmentTitle: data.shipmentTitle,
      pickupCity: data.pickupCity,
      pickupCountry: data.pickupCountry,
      deliveryCity: data.deliveryCity,
      deliveryCountry: data.deliveryCountry,
      user: req.user._id,
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.photos) data.photos = req.files.photos.map((f) => f.path);
      if (req.files.documents)
        data.documents = req.files.documents.map((f) => f.path);
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
    const populatedShipment = await shipment.populate(
      "user",
      "name email companyName country"
    ); // Populate for emitting

    // Debug: Log the created shipment to see what was saved
    console.log("📦 Created shipment:", {
      _id: shipment._id,
      shipmentTitle: shipment.shipmentTitle,
      pickupCity: shipment.pickupCity,
      pickupCountry: shipment.pickupCountry,
      deliveryCity: shipment.deliveryCity,
      deliveryCountry: shipment.deliveryCountry,
    });

    const io = getIO();
    io.emit("new-shipment", populatedShipment); // Emit new shipment event to all connected clients

    // Create notifications for shipment creation
    try {
      console.log("📦 Creating notifications for new shipment:", shipment._id);

      // 1. Notification for the user who created the shipment
      const userNotificationData = {
        recipient: req.user._id,
        type: "shipment_created",
        title: "Shipment Created Successfully",
        message: `Your shipment "${shipment.shipmentTitle}" has been created and is now available for logistics providers to bid on.`,
        priority: "medium",
        relatedEntity: {
          type: "shipment",
          id: shipment._id,
        },
        metadata: {
          shipmentId: shipment._id,
          shipmentTitle: shipment.shipmentTitle,
          pickupCity: shipment.pickupCity,
          pickupCountry: shipment.pickupCountry,
          deliveryCity: shipment.deliveryCity,
          deliveryCountry: shipment.deliveryCountry,
          estimatedValue: shipment.estimatedValue,
        },
        actions: [
          {
            label: "View Shipment",
            action: "view",
            url: `/shipments/${shipment._id}`,
            method: "GET",
          },
        ],
      };

      await NotificationService.createNotification(userNotificationData);
      console.log("✅ User notification created for shipment creation");

      // 2. Notifications for all logistics providers
      const logisticsUsers = await User.find({
        role: "logistics",
        isVerified: true,
      }).select("_id name companyName");
      console.log(
        `📋 Found ${logisticsUsers.length} verified logistics providers`
      );

      if (logisticsUsers.length > 0) {
        // Debug: Log shipment data to see what's available
        console.log("🔍 Shipment data for notification:", {
          shipmentTitle: shipment.shipmentTitle,
          pickupCity: shipment.pickupCity,
          pickupCountry: shipment.pickupCountry,
          deliveryCity: shipment.deliveryCity,
          deliveryCountry: shipment.deliveryCountry,
        });

        const logisticsNotifications = logisticsUsers.map((logisticsUser) => {
          // Create safe fallback values
          const pickupLocation =
            shipment.pickupCity && shipment.pickupCountry
              ? `${shipment.pickupCity}, ${shipment.pickupCountry}`
              : shipment.pickupCity ||
                shipment.pickupCountry ||
                "Location not specified";

          const deliveryLocation =
            shipment.deliveryCity && shipment.deliveryCountry
              ? `${shipment.deliveryCity}, ${shipment.deliveryCountry}`
              : shipment.deliveryCity ||
                shipment.deliveryCountry ||
                "Location not specified";

          return {
            recipient: logisticsUser._id,
            type: "new_shipment_available",
            title: "New Shipment Available",
            message: `A new shipment "${shipment.shipmentTitle}" from ${pickupLocation} to ${deliveryLocation} is now available for bidding.`,
            priority: "high",
            relatedEntity: {
              type: "shipment",
              id: shipment._id,
            },
            metadata: {
              shipmentId: shipment._id,
              shipmentTitle: shipment.shipmentTitle,
              pickupCity: shipment.pickupCity || "Not specified",
              pickupCountry: shipment.pickupCountry || "Not specified",
              deliveryCity: shipment.deliveryCity || "Not specified",
              deliveryCountry: shipment.deliveryCountry || "Not specified",
              estimatedValue: shipment.estimatedValue,
              preferredPickupDate: shipment.preferredPickupDate,
              preferredDeliveryDate: shipment.preferredDeliveryDate,
              createdBy: req.user._id,
              createdByName: req.user.name || req.user.companyName,
            },
            actions: [
              {
                label: "View Shipment",
                action: "view",
                url: `/shipments/${shipment._id}`,
                method: "GET",
              },
              {
                label: "Place Bid",
                action: "bid",
                url: `/shipments/${shipment._id}/bid`,
                method: "GET",
              },
            ],
          };
        });

        await NotificationService.createBulkNotifications(
          logisticsNotifications
        );
        console.log(
          `✅ Created ${logisticsNotifications.length} notifications for logistics providers`
        );
      }

      // 3. Notification for admin users
      const adminUsers = await User.find({ role: "admin" }).select("_id name");
      console.log(`📋 Found ${adminUsers.length} admin users`);

      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map((adminUser) => ({
          recipient: adminUser._id,
          type: "shipment_created",
          title: "New Shipment Created",
          message: `A new shipment "${
            shipment.shipmentTitle
          }" has been created by ${req.user.name || req.user.companyName}.`,
          priority: "medium",
          relatedEntity: {
            type: "shipment",
            id: shipment._id,
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            fromLocation: shipment.fromLocation,
            toLocation: shipment.toLocation,
            estimatedValue: shipment.estimatedValue,
            createdBy: req.user._id,
            createdByName: req.user.name || req.user.companyName,
          },
          actions: [
            {
              label: "View Shipment",
              action: "view",
              url: `/admin/shipments/${shipment._id}`,
              method: "GET",
            },
          ],
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log(
          `✅ Created ${adminNotifications.length} notifications for admin users`
        );
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating shipment notifications:",
        notificationError
      );
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
      status: { $in: ["open", "accepted", "delivered"] }, // Fetch 'open', 'accepted', and 'delivered' shipments
    };
    console.log("DEBUG: getShipments - Query:", query); // Log the query

    const shipments = await Shipment.find(query).sort({
      createdAt: -1,
    });
    console.log("DEBUG: getShipments - Shipments found:", shipments.length); // Log number of shipments

    // Get accepted bid information for each shipment
    const Bid = require("../models/Bid");
    const shipmentsWithBids = await Promise.all(
      shipments.map(async (shipment) => {
        const acceptedBid = await Bid.findOne({
          shipment: shipment._id,
          status: "accepted",
        });

        return {
          ...shipment.toObject(),
          acceptedBid: acceptedBid
            ? {
                _id: acceptedBid._id,
                price: acceptedBid.price,
                currency: acceptedBid.currency,
                eta: acceptedBid.eta,
                message: acceptedBid.message,
                createdAt: acceptedBid.createdAt,
              }
            : null,
        };
      })
    );

    return res.json({
      success: true,
      shipments: shipmentsWithBids,
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
      status: { $in: ["completed", "delivered", "returned"] },
    }).sort({ updatedAt: -1 });

    // Get accepted bid information for each shipment
    const Bid = require("../models/Bid");
    const historyWithBids = await Promise.all(
      history.map(async (shipment) => {
        const acceptedBid = await Bid.findOne({
          shipment: shipment._id,
          status: "accepted",
        });

        return {
          ...shipment.toObject(),
          acceptedBid: acceptedBid
            ? {
                _id: acceptedBid._id,
                price: acceptedBid.price,
                currency: acceptedBid.currency,
                eta: acceptedBid.eta,
                message: acceptedBid.message,
                createdAt: acceptedBid.createdAt,
              }
            : null,
        };
      })
    );

    return res.json({
      success: true,
      history: historyWithBids,
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
    console.log(
      "DEBUG: getShipmentById - Requesting shipment with ID:",
      req.params.id
    );
    const shipment = await Shipment.findById(req.params.id);
    console.log("DEBUG: getShipmentById - Result of findById:", shipment);
    if (!shipment) {
      console.log(
        "DEBUG: getShipmentById - Shipment not found for ID:",
        req.params.id
      );
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
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
    const validStatus = [
      "open",
      "accepted",
      "completed",
      "delivered",
      "returned",
    ];
    if (!validStatus.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }

    const populatedShipment = await shipment.populate(
      "user",
      "name email companyName country"
    ); // Populate for emitting
    const io = getIO();
    io.emit("shipment-updated", populatedShipment); // Emit shipment updated event

    // Create notifications for shipment status update
    try {
      console.log(
        "📦 Creating notifications for shipment status update:",
        shipment._id,
        "to",
        status
      );

      // 1. Notification for the shipment owner
      const userNotificationData = {
        recipient: shipment.user._id,
        type: "shipment_status_updated",
        title: "Shipment Status Updated",
        message: `Your shipment "${shipment.shipmentTitle}" status has been updated to "${status}".`,
        priority: "medium",
        relatedEntity: {
          type: "shipment",
          id: shipment._id,
        },
        metadata: {
          shipmentId: shipment._id,
          shipmentTitle: shipment.shipmentTitle,
          oldStatus: shipment.status,
          newStatus: status,
          updatedBy: req.user._id,
          updatedByName: req.user.name || req.user.companyName,
          updatedAt: new Date(),
        },
        actions: [
          {
            label: "View Shipment",
            action: "view",
            url: `/shipments/${shipment._id}`,
            method: "GET",
          },
        ],
      };

      await NotificationService.createNotification(userNotificationData);
      console.log("✅ User notification created for shipment status update");

      // 2. Notification for admin users
      const adminUsers = await User.find({ role: "admin" }).select("_id name");
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map((adminUser) => ({
          recipient: adminUser._id,
          type: "shipment_status_updated",
          title: "Shipment Status Updated",
          message: `Shipment "${
            shipment.shipmentTitle
          }" status has been updated to "${status}" by ${
            req.user.name || req.user.companyName
          }.`,
          priority: "low",
          relatedEntity: {
            type: "shipment",
            id: shipment._id,
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            oldStatus: shipment.status,
            newStatus: status,
            updatedBy: req.user._id,
            updatedByName: req.user.name || req.user.companyName,
            updatedAt: new Date(),
            ownerId: shipment.user._id,
          },
          actions: [
            {
              label: "View Shipment",
              action: "view",
              url: `/admin/shipments/${shipment._id}`,
              method: "GET",
            },
          ],
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log(
          "✅ Admin notifications created for shipment status update"
        );
      }

      // 3. If status is 'accepted', notify the logistics provider
      if (status === "accepted") {
        const Bid = require("../models/Bid");
        const acceptedBid = await Bid.findOne({
          shipment: shipment._id,
          status: "accepted",
        }).populate("carrier", "name email companyName");

        if (acceptedBid) {
          const logisticsNotificationData = {
            recipient: acceptedBid.carrier._id,
            type: "shipment_assigned",
            title: "Shipment Assigned to You",
            message: `You have been assigned to handle the shipment "${shipment.shipmentTitle}".`,
            priority: "high",
            relatedEntity: {
              type: "shipment",
              id: shipment._id,
            },
            metadata: {
              shipmentId: shipment._id,
              shipmentTitle: shipment.shipmentTitle,
              assignedAt: new Date(),
              bidId: acceptedBid._id,
            },
            actions: [
              {
                label: "View Shipment",
                action: "view",
                url: `/shipments/${shipment._id}`,
                method: "GET",
              },
            ],
          };

          await NotificationService.createNotification(
            logisticsNotificationData
          );
          console.log(
            "✅ Logistics notification created for shipment assignment"
          );
        }
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating status update notifications:",
        notificationError
      );
      // Don't fail the status update if notification creation fails
    }

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
      status: "open",
      user: { $ne: req.user._id }, // Exclude shipments created by the current user
    })
      .populate("user", "name email companyName country phone") // Populate comprehensive user details
      .sort({ createdAt: -1 });

    // Transform shipments to include full details and formatted data
    const enhancedShipments = shipments.map((shipment) => {
      const shipmentObj = shipment.toObject();

      // Add formatted dates
      shipmentObj.formattedPickupDate = shipment.preferredPickupDate
        ? new Date(shipment.preferredPickupDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Not specified";

      shipmentObj.formattedDeliveryDate = shipment.preferredDeliveryDate
        ? new Date(shipment.preferredDeliveryDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Not specified";

      shipmentObj.formattedCreatedDate = new Date(
        shipment.createdAt
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
      shipmentObj.quantitySummary =
        shipment.quantity > 1 ? `${shipment.quantity} items` : "1 item";

      // Add pickup/delivery summary
      shipmentObj.routeSummary = `${
        shipment.pickupCity || shipment.pickupCountry
      } → ${shipment.deliveryCity || shipment.deliveryCountry}`;

      // Add urgency indicator (if pickup date is within 3 days)
      if (shipment.preferredPickupDate) {
        const pickupDate = new Date(shipment.preferredPickupDate);
        const today = new Date();
        const diffTime = pickupDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays >= 0) {
          shipmentObj.urgency = "High";
          shipmentObj.urgencyColor = "red";
        } else if (diffDays <= 7 && diffDays >= 0) {
          shipmentObj.urgency = "Medium";
          shipmentObj.urgencyColor = "orange";
        } else {
          shipmentObj.urgency = "Normal";
          shipmentObj.urgencyColor = "green";
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
      message: "Error fetching available shipments for bidding",
      error: err.message,
    });
  }
};

// Public version for browsing open shipments without authentication
const getPublicOpenShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      status: "open",
    })
      .populate("user", "name email companyName country phone") // Populate comprehensive user details
      .sort({ createdAt: -1 });

    // Transform shipments to include full details and formatted data
    const enhancedShipments = shipments.map((shipment) => {
      const shipmentObj = shipment.toObject();

      // Add formatted dates
      shipmentObj.formattedPickupDate = shipment.preferredPickupDate
        ? new Date(shipment.preferredPickupDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Not specified";

      shipmentObj.formattedDeliveryDate = shipment.preferredDeliveryDate
        ? new Date(shipment.preferredDeliveryDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Not specified";

      shipmentObj.formattedCreatedDate = new Date(
        shipment.createdAt
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
      shipmentObj.quantitySummary =
        shipment.quantity > 1 ? `${shipment.quantity} items` : "1 item";

      // Add pickup/delivery summary
      shipmentObj.routeSummary = `${
        shipment.pickupCity || shipment.pickupCountry
      } → ${shipment.deliveryCity || shipment.deliveryCountry}`;

      // Add urgency indicator (if pickup date is within 3 days)
      if (shipment.preferredPickupDate) {
        const pickupDate = new Date(shipment.preferredPickupDate);
        const today = new Date();
        const diffTime = pickupDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays >= 0) {
          shipmentObj.urgency = "High";
          shipmentObj.urgencyColor = "red";
        } else if (diffDays <= 7 && diffDays >= 0) {
          shipmentObj.urgency = "Medium";
          shipmentObj.urgencyColor = "orange";
        } else {
          shipmentObj.urgency = "Normal";
          shipmentObj.urgencyColor = "green";
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
      message: "Error fetching open shipments",
      error: err.message,
    });
  }
};

// New: Rate a completed shipment (only after user confirms delivery)
const rateCompletedShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    // Basic validation
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating is required and must be an integer between 1 and 5.",
      });
    }

    const shipment = await Shipment.findOne({ _id: id, user: req.user._id });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found or unauthorized.",
      });
    }

    // Only allow rating if status is 'completed' (user has confirmed delivery)
    if (shipment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "You can only rate shipments after confirming delivery. Please confirm delivery first.",
      });
    }

    // Check if already rated
    if (shipment.rating) {
      return res.status(400).json({
        success: false,
        message: "This shipment has already been rated.",
      });
    }

    // Update shipment with rating and feedback
    shipment.rating = parseInt(rating);
    shipment.feedback = feedback || "";
    shipment.ratedAt = new Date();

    await shipment.save();

    console.log(
      `✅ Shipment ${shipment._id} rated ${rating} stars by user ${req.user._id}`
    );

    // Notify logistics company about the rating
    try {
      const NotificationService = require("../services/notificationService");

      if (shipment.deliveredByLogistics) {
        const notificationData = {
          recipient: shipment.deliveredByLogistics,
          type: "shipment_rated",
          title: "Shipment Rated",
          message: `Your delivery of "${shipment.shipmentTitle}" has been rated ${rating} stars by the customer.`,
          priority: "medium",
          relatedEntity: {
            type: "shipment",
            id: shipment._id,
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            rating: rating,
            feedback: feedback || "",
            ratedBy: req.user._id,
            ratedAt: shipment.ratedAt,
          },
          actions: [
            {
              label: "View Rating",
              action: "view",
              url: `/logistics/ratings`,
              method: "GET",
            },
          ],
        };

        await NotificationService.createNotification(notificationData);
        console.log("✅ Rating notification created for logistics company");
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating rating notification:",
        notificationError
      );
    }

    const populatedShipment = await shipment.populate(
      "user",
      "name email companyName country"
    );
    const io = getIO();
    io.emit("shipment-rated", populatedShipment); // Emit shipment rated event

    return res.json({
      success: true,
      message: "Thank you for rating the delivery service!",
      shipment: populatedShipment,
    });
  } catch (err) {
    console.error("ERROR: rateCompletedShipment - Error rating shipment:", err);
    return res.status(500).json({
      success: false,
      message: "Error rating shipment",
      error: err.message,
    });
  }
};

// New: Mark shipment as delivered by logistics company
const markAsDeliveredByLogistics = async (req, res) => {
  try {
    const { id } = req.params;
    const logisticsCompanyId = req.user._id;

    // First, verify that this logistics company has an accepted bid for this shipment
    const Bid = require("../models/Bid");
    const acceptedBid = await Bid.findOne({
      shipment: id,
      carrier: logisticsCompanyId,
      status: "accepted",
    });

    if (!acceptedBid) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to mark this shipment as delivered. Only logistics companies with accepted bids can mark shipments as delivered.",
      });
    }

    // Find shipment that this logistics company is handling
    const shipment = await Shipment.findById(id);

    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found." });
    }

    // Check if shipment is in a state that can be marked as delivered
    if (shipment.status !== "accepted" && shipment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Shipment must be accepted or completed before marking as delivered.",
      });
    }

    // Update shipment fields
    shipment.status = "delivered";
    shipment.deliveredByLogistics = logisticsCompanyId;
    shipment.deliveredAt = new Date();
    shipment.deliveryDate = new Date();
    shipment.awaitingUserConfirmation = true; // New: Flag to indicate user needs to confirm

    await shipment.save();

    // Populate user details for notification
    const populatedShipment = await shipment.populate(
      "user",
      "name email companyName country"
    );

    // Emit socket event for real-time updates
    const io = getIO();
    io.emit("shipment-delivered-by-logistics", populatedShipment);

    // Emit specific event to the user
    io.emit(`user-${shipment.user._id}`, {
      type: "shipment-delivered",
      message: `Your shipment "${
        shipment.shipmentTitle
      }" has been delivered by ${
        req.user.companyName || req.user.name
      }. Please confirm receipt.`,
      shipment: populatedShipment,
    });

    // Create notifications for shipment delivery
    try {
      console.log(
        "📦 Creating notifications for shipment delivery:",
        shipment._id
      );

      // 1. Notification for the user (shipment owner)
      const userNotificationData = {
        recipient: shipment.user._id,
        type: "shipment_delivered",
        title: "Shipment Delivered",
        message: `Your shipment "${
          shipment.shipmentTitle
        }" has been delivered by ${
          req.user.companyName || req.user.name
        }. Please confirm receipt.`,
        priority: "high",
        relatedEntity: {
          type: "shipment",
          id: shipment._id,
        },
        metadata: {
          shipmentId: shipment._id,
          shipmentTitle: shipment.shipmentTitle,
          deliveredBy: req.user._id,
          deliveredByName: req.user.companyName || req.user.name,
          deliveredAt: shipment.deliveredAt,
        },
        actions: [
          {
            label: "Confirm Receipt",
            action: "confirm",
            url: `/shipments/${shipment._id}/confirm`,
            method: "POST",
          },
          {
            label: "View Shipment",
            action: "view",
            url: `/shipments/${shipment._id}`,
            method: "GET",
          },
        ],
      };

      await NotificationService.createNotification(userNotificationData);
      console.log("✅ User notification created for shipment delivery");

      // 2. Notification for admin users
      const adminUsers = await User.find({ role: "admin" }).select("_id name");
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map((adminUser) => ({
          recipient: adminUser._id,
          type: "shipment_delivered",
          title: "Shipment Delivered",
          message: `Shipment "${
            shipment.shipmentTitle
          }" has been delivered by ${req.user.companyName || req.user.name}.`,
          priority: "medium",
          relatedEntity: {
            type: "shipment",
            id: shipment._id,
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            deliveredBy: req.user._id,
            deliveredByName: req.user.companyName || req.user.name,
            deliveredAt: shipment.deliveredAt,
            ownerId: shipment.user._id,
          },
          actions: [
            {
              label: "View Shipment",
              action: "view",
              url: `/admin/shipments/${shipment._id}`,
              method: "GET",
            },
          ],
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log(
          `✅ Created ${adminNotifications.length} notifications for admin users`
        );
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating delivery notifications:",
        notificationError
      );
    }

    return res.json({
      success: true,
      message:
        "Shipment marked as delivered by logistics company. User has been notified to confirm receipt.",
      shipment: populatedShipment,
    });
  } catch (err) {
    console.error(
      "ERROR: markAsDeliveredByLogistics - Error marking shipment as delivered:",
      err
    );
    return res.status(500).json({
      success: false,
      message: "Error marking shipment as delivered",
      error: err.message,
    });
  }
};

// New: Get delivered shipments awaiting user confirmation
const getDeliveredShipments = async (req, res) => {
  try {
    console.log("DEBUG: getDeliveredShipments - User ID:", req.user._id);
    console.log("DEBUG: getDeliveredShipments - User role:", req.user.role);

    let query;

    if (req.user.role === "logistics") {
      // For logistics users, get shipments they delivered
      query = {
        deliveredByLogistics: req.user._id,
        status: "delivered",
        awaitingUserConfirmation: true,
      };
    } else {
      // For regular users, get their shipments that were delivered
      query = {
        user: req.user._id,
        status: "delivered",
        awaitingUserConfirmation: true,
      };
    }

    console.log("DEBUG: getDeliveredShipments - Query:", query);

    const shipments = await Shipment.find(query)
      .populate("deliveredByLogistics", "name email companyName phone")
      .populate("user", "name email companyName phone")
      .sort({ deliveredAt: -1 });

    // Get accepted bid information for each shipment
    const Bid = require("../models/Bid");
    const shipmentsWithBids = await Promise.all(
      shipments.map(async (shipment) => {
        const acceptedBid = await Bid.findOne({
          shipment: shipment._id,
          status: "accepted",
        });

        return {
          ...shipment.toObject(),
          acceptedBid: acceptedBid
            ? {
                _id: acceptedBid._id,
                price: acceptedBid.price,
                currency: acceptedBid.currency,
                eta: acceptedBid.eta,
                message: acceptedBid.message,
                createdAt: acceptedBid.createdAt,
              }
            : null,
        };
      })
    );

    console.log(
      "DEBUG: getDeliveredShipments - Shipments found:",
      shipmentsWithBids.length
    );
    console.log(
      "DEBUG: getDeliveredShipments - Found shipments:",
      shipmentsWithBids.map((s) => ({
        id: s._id,
        title: s.shipmentTitle,
        status: s.status,
        awaitingUserConfirmation: s.awaitingUserConfirmation,
        acceptedBid: s.acceptedBid
          ? {
              price: s.acceptedBid.price,
              currency: s.acceptedBid.currency,
              eta: s.acceptedBid.eta,
            }
          : null,
      }))
    );

    return res.json({
      success: true,
      shipments: shipmentsWithBids,
    });
  } catch (err) {
    console.error(
      "ERROR: getDeliveredShipments - Error fetching delivered shipments:",
      err
    );
    return res.status(500).json({
      success: false,
      message: "Error fetching delivered shipments",
      error: err.message,
    });
  }
};

// New: Mark shipment as delivered by user
const markAsDeliveredByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find shipment that belongs to this user
    const shipment = await Shipment.findOne({ _id: id, user: userId });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message:
          "Shipment not found or you don't have permission to mark it as delivered.",
      });
    }

    // Check if shipment is in 'delivered' status and awaiting user confirmation
    if (shipment.status !== "delivered" || !shipment.awaitingUserConfirmation) {
      return res.status(400).json({
        success: false,
        message:
          "Shipment must be delivered and awaiting confirmation before you can confirm receipt.",
      });
    }

    // Update shipment fields - mark as completed since user confirmed delivery
    shipment.status = "completed";
    shipment.awaitingUserConfirmation = false;
    shipment.completedAt = new Date();
    shipment.completedByUser = userId;

    await shipment.save();

    // Populate logistics company details for notification
    const populatedShipment = await shipment.populate(
      "deliveredByLogistics",
      "name email companyName"
    );

    // Emit socket event for real-time updates
    const io = getIO();
    io.emit("shipment-delivered-by-user", populatedShipment);

    // Emit specific event to the logistics company
    if (shipment.deliveredByLogistics) {
      io.emit(`user-${shipment.deliveredByLogistics._id}`, {
        type: "shipment-delivered",
        message: `Your delivery of "${shipment.shipmentTitle}" has been confirmed by the user.`,
        shipment: populatedShipment,
      });
    }

    // Create notifications for shipment receipt confirmation
    try {
      console.log(
        "📦 Creating notifications for shipment receipt confirmation:",
        shipment._id
      );

      // 1. Notification for the logistics company
      if (shipment.deliveredByLogistics) {
        const logisticsNotificationData = {
          recipient: shipment.deliveredByLogistics._id,
          type: "shipment_delivered",
          title: "Delivery Confirmed",
          message: `Your delivery of "${shipment.shipmentTitle}" has been confirmed by the user. Great job!`,
          priority: "high",
          relatedEntity: {
            type: "shipment",
            id: shipment._id,
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            deliveredBy: userId,
            deliveredAt: shipment.deliveredAt,
            ownerName: req.user.name || req.user.companyName,
          },
          actions: [
            {
              label: "View Shipment",
              action: "view",
              url: `/shipments/${shipment._id}`,
              method: "GET",
            },
          ],
        };

        await NotificationService.createNotification(logisticsNotificationData);
        console.log(
          "✅ Logistics notification created for shipment receipt confirmation"
        );
      }

      // 2. Notification for admin users
      const adminUsers = await User.find({ role: "admin" }).select("_id name");
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map((adminUser) => ({
          recipient: adminUser._id,
          type: "shipment_delivered",
          title: "Shipment Delivered",
          message: `Shipment "${shipment.shipmentTitle}" has been confirmed as delivered by the user.`,
          priority: "medium",
          relatedEntity: {
            type: "shipment",
            id: shipment._id,
          },
          metadata: {
            shipmentId: shipment._id,
            shipmentTitle: shipment.shipmentTitle,
            deliveredBy: userId,
            deliveredAt: shipment.deliveredAt,
            deliveredBy: shipment.deliveredByLogistics,
            ownerName: req.user.name || req.user.companyName,
          },
          actions: [
            {
              label: "View Shipment",
              action: "view",
              url: `/admin/shipments/${shipment._id}`,
              method: "GET",
            },
          ],
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log(
          `✅ Created ${adminNotifications.length} notifications for admin users`
        );
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating receipt confirmation notifications:",
        notificationError
      );
    }

    return res.json({
      success: true,
      message:
        "Delivery confirmed successfully! You can now rate the delivery service.",
      shipment: populatedShipment,
    });
  } catch (err) {
    console.error(
      "ERROR: markAsDeliveredByUser - Error confirming delivery:",
      err
    );
    return res.status(500).json({
      success: false,
      message: "Error confirming delivery",
      error: err.message,
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
    const Bid = require("../models/Bid");
    const acceptedBids = await Bid.find({
      carrier: logisticsCompanyId,
      status: "accepted",
    }).populate("shipment");

    console.log("DEBUG: Found accepted bids:", acceptedBids.length);

    // Extract shipment IDs from accepted bids
    const shipmentIds = acceptedBids.map((bid) => bid.shipment._id);
    console.log("DEBUG: Shipment IDs from bids:", shipmentIds);

    // Find shipments that this logistics company is handling
    // Only include 'accepted' status - completed shipments should not appear in active shipments
    const activeShipments = await Shipment.find({
      _id: { $in: shipmentIds },
      status: "accepted",
    }).populate(
      "user",
      "name email companyName country phoneNumber firstName lastName phone contactPhone"
    );

    console.log("DEBUG: Found active shipments:", activeShipments.length);

    // Format the response with actual bid information
    const formattedShipments = activeShipments.map((shipment) => {
      // Find the corresponding bid for this shipment
      const bid = acceptedBids.find(
        (b) => b.shipment._id.toString() === shipment._id.toString()
      );

      // Add formatted dates
      const formattedPickupDate = shipment.preferredPickupDate
        ? new Date(shipment.preferredPickupDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Not specified";

      const formattedDeliveryDate = shipment.preferredDeliveryDate
        ? new Date(shipment.preferredDeliveryDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Not specified";

      // Add dimensions summary
      let dimensions = null;
      if (shipment.length && shipment.width && shipment.height) {
        dimensions = `${shipment.length}L × ${shipment.width}W × ${shipment.height}H`;
      }

      // Add weight summary
      let weightSummary = null;
      if (shipment.weight) {
        weightSummary = `${shipment.weight} kg`;
      }

      // Add quantity summary
      const quantitySummary =
        shipment.quantity > 1 ? `${shipment.quantity} items` : "1 item";

      return {
        _id: shipment._id,
        shipmentTitle: shipment.shipmentTitle,
        status: shipment.status,
        // Pickup details
        pickupAddress: shipment.pickupAddress,
        pickupCity: shipment.pickupCity,
        pickupCountry: shipment.pickupCountry,
        pickupContactPerson: shipment.pickupContactPerson,
        pickupPhoneNumber: shipment.pickupPhoneNumber,
        // Delivery details
        deliveryAddress: shipment.deliveryAddress,
        deliveryCity: shipment.deliveryCity,
        deliveryCountry: shipment.deliveryCountry,
        deliveryContactPerson: shipment.deliveryContactPerson,
        deliveryPhoneNumber: shipment.deliveryPhoneNumber,
        // Goods details
        typeOfGoods: shipment.typeOfGoods,
        descriptionOfGoods: shipment.descriptionOfGoods,
        weight: shipment.weight,
        weightSummary: weightSummary,
        length: shipment.length,
        width: shipment.width,
        height: shipment.height,
        dimensions: dimensions,
        quantity: shipment.quantity,
        quantitySummary: quantitySummary,
        // Transport details
        modeOfTransport: shipment.modeOfTransport,
        insuranceRequired: shipment.insuranceRequired,
        handlingInstructions: shipment.handlingInstructions,
        // Dates
        preferredPickupDate: shipment.preferredPickupDate,
        preferredDeliveryDate: shipment.preferredDeliveryDate,
        formattedPickupDate: formattedPickupDate,
        formattedDeliveryDate: formattedDeliveryDate,
        // Attachments
        photos: shipment.photos || [],
        documents: shipment.documents || [],
        // User details
        user: shipment.user,
        // Use actual bid information
        acceptedBid: {
          price: bid ? bid.price : 0,
          currency: bid ? bid.currency : "USD",
          eta: bid ? bid.eta : "N/A",
          message: bid ? bid.message : "",
        },
      };
    });

    console.log(
      "DEBUG: Returning formatted shipments:",
      formattedShipments.length
    );

    return res.json({
      success: true,
      shipments: formattedShipments,
    });
  } catch (err) {
    console.error(
      "ERROR: getActiveShipmentsForLogistics - Error fetching active shipments:",
      err
    );
    return res.status(500).json({
      success: false,
      message: "Error fetching active shipments for logistics company",
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
        message: "Shipment not found",
      });
    }

    // Check if user is the owner or admin
    if (
      shipment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this shipment",
      });
    }

    // Check if shipment has accepted bids (prevent deletion if shipment is in progress)
    if (
      shipment.status === "accepted" ||
      shipment.status === "in-transit" ||
      shipment.status === "delivered"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete shipment that has been accepted or is in progress",
      });
    }

    // Get shipment details before deletion for notifications
    const populatedShipment = await shipment.populate(
      "user",
      "name email companyName country"
    );

    // Find all logistics providers who had bids on this shipment
    const Bid = require("../models/Bid");
    const bidsOnShipment = await Bid.find({ shipment: id }).populate(
      "carrier",
      "name email companyName"
    );

    // Delete the shipment
    await Shipment.findByIdAndDelete(id);

    // Emit deletion event to all connected clients
    const io = getIO();
    io.emit("shipment-deleted", { shipmentId: id });

    // Create notifications for shipment deletion
    try {
      console.log("📦 Creating notifications for shipment deletion:", id);

      // 1. Notification for admin users
      const adminUsers = await User.find({ role: "admin" }).select("_id name");
      if (adminUsers.length > 0) {
        const adminNotifications = adminUsers.map((adminUser) => ({
          recipient: adminUser._id,
          type: "shipment_deleted",
          title: "Shipment Deleted",
          message: `Shipment "${
            populatedShipment.shipmentTitle
          }" has been deleted by ${
            populatedShipment.user.name || populatedShipment.user.companyName
          }.`,
          priority: "medium",
          relatedEntity: {
            type: "shipment",
            id: id,
          },
          metadata: {
            shipmentId: id,
            shipmentTitle: populatedShipment.shipmentTitle,
            deletedBy: req.user._id,
            deletedByName: req.user.name || req.user.companyName,
            deletedAt: new Date(),
            ownerId: populatedShipment.user._id,
          },
          actions: [
            {
              label: "View User",
              action: "view",
              url: `/admin/users/${populatedShipment.user._id}`,
              method: "GET",
            },
          ],
        }));

        await NotificationService.createBulkNotifications(adminNotifications);
        console.log("✅ Admin notifications created for shipment deletion");
      }

      // 2. Notifications for logistics providers who had bids on this shipment
      if (bidsOnShipment.length > 0) {
        const logisticsNotifications = bidsOnShipment.map((bid) => ({
          recipient: bid.carrier._id,
          type: "shipment_cancelled",
          title: "Shipment Cancelled",
          message: `The shipment "${populatedShipment.shipmentTitle}" you bid on has been cancelled by the owner.`,
          priority: "medium",
          relatedEntity: {
            type: "shipment",
            id: id,
          },
          metadata: {
            shipmentId: id,
            shipmentTitle: populatedShipment.shipmentTitle,
            cancelledBy: req.user._id,
            cancelledByName: req.user.name || req.user.companyName,
            cancelledAt: new Date(),
            bidId: bid._id,
          },
        }));

        await NotificationService.createBulkNotifications(
          logisticsNotifications
        );
        console.log(
          "✅ Logistics notifications created for shipment cancellation"
        );
      }
    } catch (notificationError) {
      console.error(
        "❌ Error creating deletion notifications:",
        notificationError
      );
      // Don't fail the deletion if notification creation fails
    }

    res.json({
      success: true,
      message: "Shipment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting shipment",
      error: error.message,
    });
  }
};

// Get logistics history (completed/delivered/received shipments)
const getLogisticsHistory = async (req, res) => {
  try {
    const logisticsCompanyId = req.user._id;

    // Find all bids made by this logistics company that are accepted
    const Bid = require("../models/Bid");
    const acceptedBids = await Bid.find({
      carrier: logisticsCompanyId,
      status: "accepted",
    }).populate("shipment");

    // Get shipment IDs from accepted bids
    const shipmentIds = acceptedBids.map((bid) => bid.shipment._id);

    // Find shipments that are completed or delivered
    const history = await Shipment.find({
      _id: { $in: shipmentIds },
      status: { $in: ["completed", "delivered"] },
    })
      .populate("user", "name email companyName country phoneNumber")
      .sort({ updatedAt: -1 });

    // Add bid information to each shipment
    const historyWithBids = history.map((shipment) => {
      const bid = acceptedBids.find(
        (b) => b.shipment._id.toString() === shipment._id.toString()
      );
      return {
        ...shipment.toObject(),
        bid: bid
          ? {
              _id: bid._id,
              price: bid.price,
              currency: bid.currency,
              eta: bid.eta,
              pickupDate: bid.pickupDate,
              message: bid.message,
              createdAt: bid.createdAt,
            }
          : null,
      };
    });

    res.json({
      success: true,
      history: historyWithBids,
      total: historyWithBids.length,
    });
  } catch (err) {
    console.error(
      "ERROR: getLogisticsHistory - Error fetching logistics history:",
      err
    );
    res.status(500).json({
      success: false,
      message: "Error fetching logistics history",
      error: err.message,
    });
  }
};

// Get ratings for logistics company
const getLogisticsRatings = async (req, res) => {
  try {
    const logisticsCompanyId = req.user._id;

    console.log(
      `🔍 Fetching ratings for logistics company: ${logisticsCompanyId}`
    );

    // First, let's check if there are any shipments delivered by this logistics company
    const allDeliveredShipments = await Shipment.find({
      deliveredByLogistics: logisticsCompanyId,
    });
    console.log(
      `📦 Total shipments delivered by this logistics company: ${allDeliveredShipments.length}`
    );

    // Check if any of them have ratings
    const shipmentsWithRatings = await Shipment.find({
      deliveredByLogistics: logisticsCompanyId,
      rating: { $exists: true, $ne: null },
    });
    console.log(`⭐ Shipments with ratings: ${shipmentsWithRatings.length}`);

    // Find all shipments delivered by this logistics company that have been rated
    const ratedShipments = await Shipment.find({
      deliveredByLogistics: logisticsCompanyId,
      rating: { $exists: true, $ne: null },
    })
      .populate("user", "name email companyName country phoneNumber")
      .sort({ ratedAt: -1 });

    console.log(
      `📊 Found ${ratedShipments.length} rated shipments after population`
    );

    // Format the response
    const formattedRatings = ratedShipments.map((shipment) => ({
      _id: shipment._id,
      shipmentTitle: shipment.shipmentTitle,
      rating: shipment.rating,
      feedback: shipment.feedback,
      ratedAt: shipment.ratedAt,
      user: shipment.user,
      pickupCity: shipment.pickupCity,
      pickupCountry: shipment.pickupCountry,
      deliveryCity: shipment.deliveryCity,
      deliveryCountry: shipment.deliveryCountry,
      weight: shipment.weight,
      typeOfGoods: shipment.typeOfGoods,
      modeOfTransport: shipment.modeOfTransport,
      status: shipment.status,
      budget: shipment.budget,
      estimatedCost: shipment.estimatedCost,
      currency: shipment.currency,
      completedAt: shipment.completedAt,
      deliveredAt: shipment.deliveredAt,
    }));

    console.log(`✅ Successfully formatted ${formattedRatings.length} ratings`);

    res.json({
      success: true,
      ratings: formattedRatings,
      total: formattedRatings.length,
    });
  } catch (err) {
    console.error(
      "❌ ERROR: getLogisticsRatings - Error fetching ratings:",
      err
    );
    console.error("❌ Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    res.status(500).json({
      success: false,
      message: "Error fetching ratings",
      error: err.message,
    });
  }
};

// Helper function to reverse geocode coordinates
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "RoamEase/1.0",
        },
      }
    );

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error.message);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Update shipment location (for logistics companies)
const updateShipmentLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, speed = 0, heading = 0 } = req.body;
    const logisticsCompanyId = req.user._id;

    // Validate coordinates
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates provided",
      });
    }

    // Check if this logistics company has an accepted bid for this shipment
    const Bid = require("../models/Bid");
    const acceptedBid = await Bid.findOne({
      shipment: id,
      carrier: logisticsCompanyId,
      status: "accepted",
    });

    if (!acceptedBid) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to update location for this shipment",
      });
    }

    // Find the shipment
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Check if shipment is in a trackable state
    if (shipment.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Shipment must be accepted to enable location tracking",
      });
    }

    // Reverse geocode the location
    const address = await reverseGeocode(lat, lng);

    // Create location data
    const locationData = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed) || 0,
      heading: parseFloat(heading) || 0,
      timestamp: new Date(),
      address,
    };

    // Update shipment with new location
    shipment.lastLocation = locationData;
    shipment.locationHistory.push(locationData);

    // Start tracking if not already active
    if (!shipment.isTrackingActive) {
      shipment.isTrackingActive = true;
      shipment.trackingStartedAt = new Date();
    }

    await shipment.save();

    // Emit real-time location update via Socket.IO
    const io = getIO();
    io.to(`shipment:${id}`).emit("locationUpdate", {
      shipmentId: id,
      location: locationData,
      timestamp: new Date(),
    });

    // Also emit to the shipment owner
    io.to(`user-${shipment.user}`).emit("shipmentLocationUpdate", {
      shipmentId: id,
      shipmentTitle: shipment.shipmentTitle,
      location: locationData,
      timestamp: new Date(),
    });

    console.log(`📍 Location updated for shipment ${id}: ${lat}, ${lng}`);

    return res.json({
      success: true,
      message: "Location updated successfully",
      location: locationData,
    });
  } catch (error) {
    console.error("Error updating shipment location:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating location",
      error: error.message,
    });
  }
};

// Get shipment tracking data
const getShipmentTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the shipment
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Check if user has permission to view tracking (owner or logistics company handling it)
    const Bid = require("../models/Bid");

    // First, find any accepted bid for this shipment (regardless of who is viewing)
    const acceptedBid = await Bid.findOne({
      shipment: id,
      status: "accepted",
    });

    console.log("🔍 User ID:", userId);
    console.log("🔍 Shipment owner:", shipment.user);
    console.log("🔍 Accepted bid:", acceptedBid);

    const isOwner = shipment.user.toString() === userId.toString();
    const isLogisticsHandler =
      acceptedBid && acceptedBid.carrier.toString() === userId.toString();

    console.log("🔍 Is owner:", isOwner);
    console.log("🔍 Is logistics handler:", isLogisticsHandler);

    if (!isOwner && !isLogisticsHandler && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view tracking for this shipment",
      });
    }

    // Get the logistics company handling this shipment
    let logisticsCompany = null;
    if (acceptedBid) {
      logisticsCompany = await User.findById(acceptedBid.carrier).select(
        "name companyName phone email address bio country profilePicture isOnline lastSeen"
      );
      console.log("🔍 Logistics company data:", logisticsCompany);
    }

    const responseData = {
      success: true,
      tracking: {
        isTrackingActive: shipment.isTrackingActive,
        lastLocation: shipment.lastLocation,
        locationHistory: shipment.locationHistory,
        trackingStartedAt: shipment.trackingStartedAt,
        trackingEndedAt: shipment.trackingEndedAt,
        logisticsCompany,
        eta: acceptedBid ? acceptedBid.eta : null,
      },
    };

    console.log(
      "🔍 Tracking response data:",
      JSON.stringify(responseData, null, 2)
    );

    // Debug: Check if there are any bids for this shipment
    const allBids = await Bid.find({ shipment: id });
    console.log("🔍 All bids for shipment:", allBids);

    return res.json(responseData);
  } catch (error) {
    console.error("Error getting shipment tracking:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting tracking data",
      error: error.message,
    });
  }
};

// Start tracking for a shipment
const startTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const logisticsCompanyId = req.user._id;

    // Check if this logistics company has an accepted bid for this shipment
    const acceptedBid = await Bid.findOne({
      shipment: id,
      carrier: logisticsCompanyId,
      status: "accepted",
    });

    if (!acceptedBid) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to start tracking for this shipment",
      });
    }

    // Find the shipment
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    if (shipment.isTrackingActive) {
      return res.status(400).json({
        success: false,
        message: "Tracking is already active for this shipment",
      });
    }

    // Start tracking
    shipment.isTrackingActive = true;
    shipment.trackingStartedAt = new Date();
    await shipment.save();

    // Emit tracking started event
    const io = getIO();
    io.to(`shipment:${id}`).emit("trackingStarted", {
      shipmentId: id,
      startedAt: shipment.trackingStartedAt,
    });

    io.to(`user-${shipment.user}`).emit("shipmentTrackingStarted", {
      shipmentId: id,
      shipmentTitle: shipment.shipmentTitle,
      startedAt: shipment.trackingStartedAt,
    });

    return res.json({
      success: true,
      message: "Tracking started successfully",
      trackingStartedAt: shipment.trackingStartedAt,
    });
  } catch (error) {
    console.error("Error starting tracking:", error);
    return res.status(500).json({
      success: false,
      message: "Error starting tracking",
      error: error.message,
    });
  }
};

// Stop tracking for a shipment
const stopTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const logisticsCompanyId = req.user._id;

    // Check if this logistics company has an accepted bid for this shipment
    const acceptedBid = await Bid.findOne({
      shipment: id,
      carrier: logisticsCompanyId,
      status: "accepted",
    });

    if (!acceptedBid) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to stop tracking for this shipment",
      });
    }

    // Find the shipment
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    if (!shipment.isTrackingActive) {
      return res.status(400).json({
        success: false,
        message: "Tracking is not active for this shipment",
      });
    }

    // Stop tracking
    shipment.isTrackingActive = false;
    shipment.trackingEndedAt = new Date();
    await shipment.save();

    // Emit tracking stopped event
    const io = getIO();
    io.to(`shipment:${id}`).emit("trackingStopped", {
      shipmentId: id,
      stoppedAt: shipment.trackingEndedAt,
    });

    io.to(`user-${shipment.user}`).emit("shipmentTrackingStopped", {
      shipmentId: id,
      shipmentTitle: shipment.shipmentTitle,
      stoppedAt: shipment.trackingEndedAt,
    });

    return res.json({
      success: true,
      message: "Tracking stopped successfully",
      trackingEndedAt: shipment.trackingEndedAt,
    });
  } catch (error) {
    console.error("Error stopping tracking:", error);
    return res.status(500).json({
      success: false,
      message: "Error stopping tracking",
      error: error.message,
    });
  }
};

// Get public tracking data (no authentication required)
const getPublicShipmentTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Check if shipment has an accepted bid
    const acceptedBid = await Bid.findOne({
      shipment: id,
      status: "accepted",
    });

    if (!acceptedBid) {
      return res.status(404).json({
        success: false,
        message: "No tracking available for this shipment",
      });
    }

    // Get the logistics company handling this shipment
    let logisticsCompany = null;
    if (acceptedBid) {
      logisticsCompany = await User.findById(acceptedBid.carrier).select(
        "name companyName phone email address bio country profilePicture isOnline lastSeen"
      );
    }

    const responseData = {
      success: true,
      tracking: {
        isTrackingActive: shipment.isTrackingActive,
        lastLocation: shipment.lastLocation,
        locationHistory: shipment.locationHistory,
        trackingStartedAt: shipment.trackingStartedAt,
        trackingEndedAt: shipment.trackingEndedAt,
        logisticsCompany,
        eta: acceptedBid ? acceptedBid.eta : null,
      },
    };

    return res.json(responseData);
  } catch (error) {
    console.error("Error getting public shipment tracking:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting tracking data",
      error: error.message,
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
  markAsDeliveredByLogistics,
  markAsDeliveredByUser,
  getDeliveredShipments, // New: Export the delivered shipments function
  getActiveShipmentsForLogistics, // New: Export the active shipments function
  deleteShipment, // New: Export the delete shipment function
  getLogisticsHistory, // New: Export the logistics history function
  rateCompletedShipment, // New: Export the rate completed shipment function
  getLogisticsRatings, // New: Export the get logistics ratings function
  updateShipmentLocation, // New: Export location tracking functions
  getShipmentTracking,
  startTracking,
  stopTracking,
  getPublicShipmentTracking, // New: Export public tracking function
};
