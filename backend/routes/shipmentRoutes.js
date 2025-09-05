const express = require('express');
const router = express.Router();

const {
  createShipment,
  getShipments,
  getShipmentHistory,
  getShipmentById,
  updateShipmentStatus,
  getAvailableShipmentsForCarrier,
  markAsDeliveredAndRate,
  markAsDeliveredByLogistics,
  markAsReceivedByUser,
  getActiveShipmentsForLogistics, // New: Import the active shipments function
  deleteShipment, // New: Import the delete shipment function
  getLogisticsHistory // New: Import the logistics history function
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

// New: Route for carriers to fetch available shipments for bidding (MUST come before /:id)
router.get('/available-for-bidding', protect, getAvailableShipmentsForCarrier);

// New: Route for logistics companies to get their active shipments
router.get('/my-active-shipments', protect, allowRoles('logistics'), getActiveShipmentsForLogistics);

// New: Route for logistics companies to get their history
router.get('/logistics-history', protect, allowRoles('logistics'), getLogisticsHistory);

router.get('/:id', protect, getShipmentById);
router.put('/:id/status', protect, updateShipmentStatus);
router.delete('/:id', protect, deleteShipment); // New: Route to delete shipment
router.put('/:id/deliver', protect, allowRoles('user'), markAsDeliveredAndRate); // Route to mark shipment as delivered and rate
router.put('/:id/mark-delivered-by-logistics', protect, allowRoles('logistics'), markAsDeliveredByLogistics); // New: Route for logistics to mark as delivered
router.put('/:id/mark-received-by-user', protect, allowRoles('user'), markAsReceivedByUser); // New: Route for users to mark as received

module.exports = router;
