const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middlewares/authMiddleware'); // Destructure both protect and allowRoles
const {
  createBid,
  getBidsForShipment,
  acceptBid,
  getMyBids,
  rejectBid,
  restoreBid,
  getAllBids,
  updateBid,
  deleteBid,
  markBidAsSeen,
  getBidsOnMyShipments, // Added getBidsOnMyShipments
  requestPriceUpdate,
  respondToPriceUpdateRequest,
} = require('../controllers/bidController');

console.log('createBid:', createBid);
console.log('protect:', protect);
console.log('allowRoles:', allowRoles);


// Logistics creates a bid
router.post('/', protect, allowRoles('logistics'), createBid);

// User (or admin) gets all bids for a shipment
router.get('/shipment/:shipmentId', protect, allowRoles('user', 'admin'), getBidsForShipment);

// User, logistics, or admin gets all bids on their own shipments
router.get('/on-my-shipments', protect, allowRoles('user', 'logistics', 'admin'), getBidsOnMyShipments);

// User (or admin) accepts a bid
router.put('/:id/accept', protect, allowRoles('user', 'admin'), acceptBid);

// Logistics gets all their own bids
router.get('/my-bids', protect, allowRoles('logistics'), getMyBids);

// User (or admin) rejects a bid
router.put('/:id/reject', protect, allowRoles('user', 'admin'), rejectBid);

// User (or admin) restores a bid
router.put('/:id/restore', protect, allowRoles('user', 'admin'), restoreBid);

// Admin gets all bids
router.get('/all', protect, allowRoles('admin'), getAllBids);

// Logistics updates their own bid
router.put('/:id', protect, allowRoles('logistics'), updateBid);

// Logistics deletes their own bid
router.delete('/:id', protect, allowRoles('logistics'), deleteBid);

// Mark bid as seen by user
router.put('/:id/seen', protect, allowRoles('user', 'admin'), markBidAsSeen);

// Request price update for a bid (only user)
router.post('/:id/request-price-update', protect, allowRoles('user'), requestPriceUpdate);

// Respond to price update request (only logistics)
router.put('/:id/respond-price-update', protect, allowRoles('logistics'), respondToPriceUpdateRequest);

module.exports = router;
