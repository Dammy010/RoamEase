const Bid = require('../models/Bid');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const Conversation = require('../models/Conversation'); // New: Import Conversation model
const { createConversation: chatCreateConversation } = require('../controllers/chatController'); // New: Import createConversation from chatController
const { getIO } = require('../socket'); // New: Import getIO to access Socket.io instance

// Create a bid for a shipment (only carriers/logistics)
const createBid = async (req, res) => {
  try {
    const { shipmentId, price, eta, message } = req.body;

    // --- DEBUGGING LOGS ---
    console.log("DEBUG: createBid - req.body:", req.body);
    console.log("DEBUG: createBid - req.user:", req.user);
    // --- END DEBUGGING LOGS ---

    // Validation
    if (!shipmentId || !price || !eta) {
      return res.status(400).json({ message: 'Missing required fields: shipmentId, price, and eta are required' });
    }

    if (req.user.role !== 'logistics' && req.user.role !== 'carrier') {
      return res.status(403).json({ message: 'Only logistics providers and carriers can create bids' });
    }

    // Check if logistics provider is verified
    if (req.user.role === 'logistics') {
      const logisticsUser = await User.findById(req.user._id);
      if (!logisticsUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (logisticsUser.verificationStatus !== 'verified') {
        return res.status(403).json({ 
          message: 'Only verified logistics providers can create bids',
          verificationStatus: logisticsUser.verificationStatus,
          details: 'Your account is pending verification. Please wait for admin approval before posting bids.'
        });
      }
    }

    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    const bid = await Bid.create({
      shipment: shipmentId,
      carrier: req.user._id,
      role: 'carrier', // Always set as 'carrier' for the schema
      price,
      eta,
      message: message || '',
    });

    // Fetch the newly created bid and populate it with necessary details
    const populatedBid = await Bid.findById(bid._id)
      .populate('carrier', 'name email companyName country')
      .populate('shipment');

    // New: Create or get conversation after bid is placed
    const conversationData = {
      body: { recipientId: shipment.user, shipmentId: shipmentId }, // Shipper is the recipient
      user: req.user // Carrier is the sender
    };
    
    // Simulate req and res for chatCreateConversation
    let conversationRes = {};
    const mockChatRes = {
        status: (code) => {
            conversationRes.statusCode = code;
            return mockChatRes;
        },
        json: (data) => {
            conversationRes.data = data;
        }
    };
    await chatCreateConversation(conversationData, mockChatRes); // Pass mock req and res

    let conversation = null;
    if (conversationRes.statusCode === 201 || conversationRes.statusCode === 200) {
        conversation = conversationRes.data; // Get the created or existing conversation

        // Log the conversation ID for debugging
        console.log("DEBUG: createBid - Created/Retrieved Conversation ID:", conversation._id);

        // New: Emit a socket event to the shipper to notify them of a new bid and conversation
        const io = getIO();
        io.to(shipment.user.toString()).emit('new-bid-for-shipper', {
            shipmentId: shipmentId,
            conversationId: conversation._id,
            bid: populatedBid.toObject() // Include bid details for the notification
        });

    } else {
        console.error("Failed to create/get conversation:", conversationRes.data);
    }

    const io = getIO();
    io.emit('new-bid', populatedBid); // Emit new bid event

    res.status(201).json({ ...populatedBid.toObject(), conversationId: conversation ? conversation._id : null }); // Return conversationId
  } catch (err) {
    console.error('Create bid error:', err);
    res.status(500).json({ message: 'Error creating bid', error: err.message });
  }
};

// Get all bids for a shipment (only for shipper/admin)
const getBidsForShipment = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    console.log("DEBUG: getBidsForShipment - Requesting bids for shipment ID:", shipmentId);
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    // --- DEBUGGING LOGS ---
    console.log("DEBUG: getBidsForShipment - req.user:", req.user); // Log the user making the request
    console.log("DEBUG: getBidsForShipment - shipment.user:", shipment.user); // Log the owner of the shipment
    console.log("DEBUG: getBidsForShipment - Is shipper (req.user is owner)?:", shipment.user.toString() === req.user._id.toString());
    // --- END DEBUGGING LOGS ---

    // Authorization check: Only the shipment owner or admin can view bids
    if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log("DEBUG: getBidsForShipment - Authorization failed. User is not the shipment owner and not admin.");
      return res.status(403).json({ message: 'Not authorized to view bids for this shipment' });
    }

    const bids = await Bid.find({ shipment: shipmentId })
      .populate('carrier', 'name email role companyName country')
      .sort({ createdAt: -1 });

    // Add conversation information to each bid
    const bidsWithConversations = await Promise.all(
      bids.map(async (bid) => {
        // Find conversation between the shipper and the carrier for this shipment
        const conversation = await Conversation.findOne({
          participants: { $all: [shipment.user, bid.carrier._id] },
          shipment: shipmentId
        });
        
        return {
          ...bid.toObject(),
          conversationId: conversation ? conversation._id : null
        };
      })
    );

    // DEBUG: Log populated bids before sending to frontend
    console.log("DEBUG: getBidsForShipment - Populated Bids with conversations:", bidsWithConversations);

    res.json(bidsWithConversations);
  } catch (err) {
    console.error('ERROR: getBidsForShipment - Error fetching bids:', err);
    res.status(500).json({ message: 'Error fetching bids', error: err.message });
  }
};

// Accept a bid (only shipper/admin)
const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const shipment = await Shipment.findById(bid.shipment);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to accept this bid' });
    }

    bid.status = 'accepted';
    await bid.save();

    await Bid.updateMany(
      { shipment: bid.shipment, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    shipment.status = 'accepted';
    await shipment.save();

    // Fetch the updated bid and populate it with necessary details
    const populatedBid = await Bid.findById(bid._id)
      .populate('carrier', 'name email companyName country')
      .populate('shipment');

    const io = getIO();
    io.emit('bid-updated', populatedBid); // Emit bid updated event

    // Also emit a shipment-updated event because the shipment status has changed
    const populatedShipment = await shipment.populate('user', 'name email companyName country');
    io.emit('shipment-updated', populatedShipment);


    res.json(populatedBid);
  } catch (err) {
    console.error('Accept bid error:', err);
    res.status(500).json({ message: 'Error accepting bid', error: err.message });
  }
};

// Get bids made by the logged-in carrier/logistics
const getMyBids = async (req, res) => {
  try {
    if (req.user.role !== 'logistics' && req.user.role !== 'carrier') {
      return res.status(403).json({ message: 'Only logistics providers and carriers can view their bids' });
    }

    const bids = await Bid.find({ carrier: req.user._id })
      .populate({
        path: 'shipment',
        populate: {
          path: 'user',
          select: 'name email companyName country phoneNumber'
        }
      })
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    console.error('Get my bids error:', err);
    res.status(500).json({ message: 'Error fetching bids', error: err.message });
  }
};

const rejectBid = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findById(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const shipment = await Shipment.findById(bid.shipment);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    // Check authorization
    if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reject this bid' });
    }

    // Update bid status to rejected
    bid.status = 'rejected';
    await bid.save();

    // Fetch the updated bid and populate it with necessary details
    const populatedBid = await Bid.findById(id)
      .populate('carrier', 'name email role companyName country')
      .populate('shipment', 'shipmentTitle status pickupAddress deliveryAddress');

    // Emit socket event
    const io = getIO();
    io.emit('bid-updated', populatedBid);

    res.json(populatedBid);
  } catch (err) {
    console.error('Reject bid error:', err);
    res.status(500).json({ message: 'Error rejecting bid', error: err.message });
  }
};

const restoreBid = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findById(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const shipment = await Shipment.findById(bid.shipment);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    // Check authorization
    if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to restore this bid' });
    }

    // Update bid status back to pending (can be restored from rejected status)
    bid.status = 'pending';
    await bid.save();

    const populatedBid = await Bid.findById(id)
      .populate('carrier', 'name email role companyName country')
      .populate('shipment', 'shipmentTitle status pickupAddress deliveryAddress');

    // Emit socket event
    const io = getIO();
    io.emit('bid-updated', populatedBid);

    res.json(populatedBid);
  } catch (err) {
    console.error('Restore bid error:', err);
    res.status(500).json({ message: 'Error restoring bid', error: err.message });
  }
};

// Get all bids for shipments posted by the logged-in user (shipper)
const getBidsOnMyShipments = async (req, res) => {
  try {
    console.log("DEBUG: getBidsOnMyShipments - Request from user:", req.user._id, "Role:", req.user.role);
    
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      console.log("DEBUG: getBidsOnMyShipments - User role not authorized:", req.user.role);
      return res.status(403).json({ message: 'Only shippers and admins can view bids on their shipments' });
    }

    // Find all shipments posted by the logged-in user
    const userShipments = await Shipment.find({ user: req.user._id });
    console.log("DEBUG: getBidsOnMyShipments - User shipments found:", userShipments.length);
    console.log("DEBUG: getBidsOnMyShipments - Shipment IDs:", userShipments.map(s => s._id));
    
    const shipmentIds = userShipments.map(shipment => shipment._id);

    // Find all bids associated with these shipments
    const bids = await Bid.find({ shipment: { $in: shipmentIds } })
      .populate('carrier', 'name email role companyName country phone')
      .populate('shipment', 'shipmentTitle status pickupAddress deliveryAddress pickupCity deliveryCity typeOfGoods weight budget createdAt user modeOfTransport')
      .sort({ createdAt: -1 });

    console.log("DEBUG: getBidsOnMyShipments - Bids found:", bids.length);
    console.log("DEBUG: getBidsOnMyShipments - Bids data:", bids);

    res.json(bids);
  } catch (err) {
    console.error("ERROR: getBidsOnMyShipments - Error fetching bids on user's shipments:", err);
    res.status(500).json({ message: "Error fetching bids on user's shipments", error: err.message });
  }
};

// Get all bids (for admin)
const getAllBids = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all bids' });
    }

    const bids = await Bid.find({})
      .populate('carrier', 'name email role companyName country')
      .populate('shipment', 'shipmentTitle status pickupAddress deliveryAddress')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    console.error('Get all bids error:', err);
    res.status(500).json({ message: 'Error fetching bids', error: err.message });
  }
};

// Update bid (for carriers to update their own bids)
const updateBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, eta, message } = req.body;

    const bid = await Bid.findById(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bid belongs to the logged-in carrier/logistics
    if (bid.carrier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this bid' });
    }

    // Check if bid is still pending (can only update pending bids)
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending bids' });
    }

    // Update bid fields
    if (price !== undefined) bid.price = price;
    if (eta !== undefined) bid.eta = eta;
    if (message !== undefined) bid.message = message;

    await bid.save();

    // Fetch the updated bid and populate it with necessary details
    const populatedBid = await Bid.findById(id)
      .populate('carrier', 'name email role companyName country')
      .populate('shipment', 'shipmentTitle status pickupAddress deliveryAddress');

    // Emit socket event
    const io = getIO();
    io.emit('bid-updated', populatedBid);

    res.json(populatedBid);
  } catch (err) {
    console.error('Update bid error:', err);
    res.status(500).json({ message: 'Error updating bid', error: err.message });
  }
};

// Delete bid (for carriers to delete their own bids)
const deleteBid = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findById(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bid belongs to the logged-in carrier/logistics
    if (bid.carrier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this bid' });
    }

    // Check if bid is still pending (can only delete pending bids)
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending bids' });
    }

    await Bid.findByIdAndDelete(id);

    // Emit socket event
    const io = getIO();
    io.emit('bid-deleted', { bidId: id, shipmentId: bid.shipment });

    res.json({ message: 'Bid deleted successfully' });
  } catch (err) {
    console.error('Delete bid error:', err);
    res.status(500).json({ message: 'Error deleting bid', error: err.message });
  }
};

// Mark bid as seen by shipper
const markBidAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findById(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const shipment = await Shipment.findById(bid.shipment);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    // Check if user is the shipper or admin
    if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to mark this bid as seen' });
    }

    bid.seenByShipper = true;
    await bid.save();

    res.json({ message: 'Bid marked as seen' });
  } catch (err) {
    console.error('Mark bid as seen error:', err);
    res.status(500).json({ message: 'Error marking bid as seen', error: err.message });
  }
};

module.exports = {
  createBid,
  getBidsForShipment,
  acceptBid,
  rejectBid,
  restoreBid,
  getMyBids,
  getAllBids,
  updateBid,
  deleteBid,
  markBidAsSeen,
  getBidsOnMyShipments, // New: Export getBidsOnMyShipments
};
