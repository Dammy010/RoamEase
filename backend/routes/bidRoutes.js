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


// Carrier/Logistics creates a bid
router.post('/', protect, allowRoles('carrier', 'logistics'), createBid);

// Shipper (or admin) gets all bids for a shipment
router.get('/shipment/:shipmentId', protect, allowRoles('user', 'admin'), getBidsForShipment);

// Shipper (or admin) gets all bids on their own shipments
router.get('/on-my-shipments', protect, allowRoles('user', 'admin'), getBidsOnMyShipments); // New route

// Shipper (or admin) accepts a bid
router.put('/:id/accept', protect, allowRoles('user', 'admin'), acceptBid);

// Carrier/Logistics gets all their own bids
router.get('/my-bids', protect, allowRoles('carrier', 'logistics'), getMyBids);

// Shipper (or admin) rejects a bid
router.put('/:id/reject', protect, allowRoles('user', 'admin'), rejectBid);

// Shipper (or admin) restores a bid
router.put('/:id/restore', protect, allowRoles('user', 'admin'), restoreBid);

// Admin gets all bids
router.get('/all', protect, allowRoles('admin'), getAllBids);

// Carrier/Logistics updates their own bid
router.put('/:id', protect, allowRoles('carrier', 'logistics'), updateBid);

// Carrier/Logistics deletes their own bid
router.delete('/:id', protect, allowRoles('carrier', 'logistics'), deleteBid);

// Mark bid as seen by shipper
router.put('/:id/seen', protect, allowRoles('user', 'admin'), markBidAsSeen);

// Request price update for a bid (only shipper)
router.post('/:id/request-price-update', protect, allowRoles('user'), requestPriceUpdate);

// Respond to price update request (only logistics)
router.put('/:id/respond-price-update', protect, allowRoles('carrier', 'logistics'), respondToPriceUpdateRequest);

module.exports = router;
