const express = require('express');
const router = express.Router();

const {
  createShipment,
  getShipments,
  getShipmentHistory,
  getShipmentById,
  updateShipmentStatus,
  getAvailableShipmentsForCarrier,
  getPublicOpenShipments, // New: Import the public open shipments function
  markAsDeliveredByLogistics,
  markAsDeliveredByUser,
  getDeliveredShipments, // New: Import the delivered shipments function
  getActiveShipmentsForLogistics, // New: Import the active shipments function
  deleteShipment, // New: Import the delete shipment function
  getLogisticsHistory, // New: Import the logistics history function
  rateCompletedShipment, // New: Import the rate completed shipment function
  getLogisticsRatings // New: Import the get logistics ratings function
} = require('../controllers/shipmentController');

const { protect, allowRoles } = require('../middlewares/authMiddleware'); // Destructure both protect and allowRoles
const upload = require('../middlewares/uploadMiddleware'); 

const shipmentUpload = upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'documents', maxCount: 10 },
]);

// Routes
router.post('/', protect, shipmentUpload, createShipment);
router.get('/', protect, getShipments);
router.get('/history', protect, getShipmentHistory); // 👈 new

// Public route for browsing open shipments (no authentication required)
router.get('/public/open-shipments', getPublicOpenShipments);

// New: Route for carriers to fetch available shipments for bidding (MUST come before /:id)
router.get('/available-for-bidding', protect, getAvailableShipmentsForCarrier);

// New: Route for logistics companies to get their active shipments
router.get('/my-active-shipments', protect, allowRoles('logistics'), getActiveShipmentsForLogistics);

// New: Route for logistics companies to get their history
router.get('/logistics-history', protect, allowRoles('logistics'), getLogisticsHistory);

// New: Route for users to get delivered shipments awaiting confirmation
router.get('/delivered', protect, allowRoles('user'), getDeliveredShipments);

router.get('/:id', protect, getShipmentById);
router.put('/:id/status', protect, updateShipmentStatus);
router.delete('/:id', protect, deleteShipment); // New: Route to delete shipment
// Removed: markAsDeliveredAndRate route (replaced with separate rate and deliver routes)
router.put('/:id/mark-delivered-by-logistics', protect, allowRoles('logistics'), markAsDeliveredByLogistics); // New: Route for logistics to mark as delivered
router.put('/:id/mark-delivered-by-user', protect, allowRoles('user'), markAsDeliveredByUser); // New: Route for users to mark as delivered
router.put('/:id/rate', protect, allowRoles('user'), rateCompletedShipment); // New: Route for users to rate completed shipments

// New: Route for logistics companies to get their ratings
router.get('/my-ratings', protect, allowRoles('logistics'), getLogisticsRatings);

module.exports = router;
