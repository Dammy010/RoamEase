/**
 * 🎨 Beautiful Validation Helper
 * Provides comprehensive input validation and sanitization
 */

const { body, validationResult } = require('express-validator');

class ValidationHelper {
  /**
   * ✨ Handle validation errors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
        timestamp: new Date().toISOString(),
        status: 400
      });
    }
    next();
  }

  /**
   * 🔐 User registration validation
   */
  static validateUserRegistration() {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
      
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
      
      body('role')
        .optional()
        .isIn(['user', 'logistics', 'admin'])
        .withMessage('Role must be user, logistics, or admin'),
      
      body('phoneNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
    ];
  }

  /**
   * 🚚 Shipment validation
   */
  static validateShipment() {
    return [
      body('shipmentTitle')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Shipment title must be between 5 and 100 characters'),
      
      body('pickupAddress')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Pickup address must be between 10 and 200 characters'),
      
      body('deliveryAddress')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Delivery address must be between 10 and 200 characters'),
      
      body('pickupCity')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Pickup city must be between 2 and 50 characters'),
      
      body('deliveryCity')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Delivery city must be between 2 and 50 characters'),
      
      body('preferredPickupDate')
        .isISO8601()
        .withMessage('Please provide a valid pickup date')
        .custom((value) => {
          if (new Date(value) < new Date()) {
            throw new Error('Pickup date cannot be in the past');
          }
          return true;
        }),
      
      body('preferredDeliveryDate')
        .isISO8601()
        .withMessage('Please provide a valid delivery date')
        .custom((value) => {
          if (new Date(value) < new Date()) {
            throw new Error('Delivery date cannot be in the past');
          }
          return true;
        }),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
    ];
  }

  /**
   * 💰 Bid validation
   */
  static validateBid() {
    return [
      body('amount')
        .isNumeric()
        .withMessage('Amount must be a valid number')
        .isFloat({ min: 0 })
        .withMessage('Amount must be greater than 0'),
      
      body('pickupDate')
        .isISO8601()
        .withMessage('Please provide a valid pickup date')
        .custom((value) => {
          if (new Date(value) < new Date()) {
            throw new Error('Pickup date cannot be in the past');
          }
          return true;
        }),
      
      body('message')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Message cannot exceed 300 characters')
    ];
  }

  /**
   * 💬 Message validation
   */
  static validateMessage() {
    return [
      body('text')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Message text cannot exceed 1000 characters'),
      
      body('conversationId')
        .isMongoId()
        .withMessage('Please provide a valid conversation ID')
    ];
  }

  /**
   * 🔍 Pagination validation
   */
  static validatePagination() {
    return [
      body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
    ];
  }

  /**
   * 🧹 Sanitize input data
   * @param {Object} data - Data to sanitize
   */
  static sanitizeInput(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * 📧 Email validation
   * @param {string} email - Email to validate
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 📱 Phone validation
   * @param {string} phone - Phone number to validate
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * 🔒 Password strength validation
   * @param {string} password - Password to validate
   */
  static isStrongPassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      strength: {
        length: password.length >= minLength,
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        numbers: hasNumbers,
        special: hasSpecialChar
      }
    };
  }
}

module.exports = ValidationHelper;
