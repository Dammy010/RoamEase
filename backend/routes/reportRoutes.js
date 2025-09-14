const express = require('express');
const router = express.Router();
const {
  createReport,
  getUserReports,
  getAllReports,
  getReport,
  updateReport,
  addComment,
  getReportStats,
  deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// Validation middleware
const createReportValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'technical_issue',
      'service_complaint',
      'payment_issue',
      'delivery_problem',
      'communication_issue',
      'account_issue',
      'feature_request',
      'bug_report',
      'other'
    ])
    .withMessage('Invalid report category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('relatedShipment')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null/empty values
      }
      return /^[0-9a-fA-F]{24}$/.test(value); // Check if it's a valid MongoDB ObjectId
    })
    .withMessage('Invalid shipment ID'),
  body('relatedBid')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null/empty values
      }
      return /^[0-9a-fA-F]{24}$/.test(value); // Check if it's a valid MongoDB ObjectId
    })
    .withMessage('Invalid bid ID'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const updateReportValidation = [
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed', 'rejected'])
    .withMessage('Invalid status'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('resolution')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resolution cannot exceed 1000 characters')
];

const addCommentValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean')
];

// User and Logistics routes
router.post('/create', createReportValidation, createReport);
router.get('/my-reports', getUserReports);
router.get('/:id', getReport);
router.post('/:id/comment', addCommentValidation, addComment);

// Admin only routes
router.get('/admin/all', allowRoles(['admin']), getAllReports);
router.get('/admin/stats', allowRoles(['admin']), getReportStats);
router.put('/admin/:id', allowRoles(['admin']), updateReportValidation, updateReport);
router.delete('/admin/:id', allowRoles(['admin']), deleteReport);

module.exports = router;
