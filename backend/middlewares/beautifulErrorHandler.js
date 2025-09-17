/**
 * 🎨 Beautiful Error Handler Middleware
 * Provides elegant error handling with proper logging and user-friendly responses
 */

const Logger = require('../utils/logger');
const ResponseHelper = require('../utils/responseHelper');

class BeautifulErrorHandler {
  /**
   * 🎨 Main error handler middleware
   * @param {Error} err - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handleError(err, req, res, next) {
    // Log the error with beautiful formatting
    Logger.error(`💥 Error occurred: ${err.message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Handle different types of errors
    if (err.name === 'ValidationError') {
      return BeautifulErrorHandler.handleValidationError(err, res);
    }

    if (err.name === 'CastError') {
      return BeautifulErrorHandler.handleCastError(err, res);
    }

    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return BeautifulErrorHandler.handleMongoError(err, res);
    }

    if (err.name === 'JsonWebTokenError') {
      return BeautifulErrorHandler.handleJWTError(err, res);
    }

    if (err.name === 'TokenExpiredError') {
      return BeautifulErrorHandler.handleTokenExpiredError(err, res);
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return BeautifulErrorHandler.handleFileSizeError(err, res);
    }

    // Default error handling
    return BeautifulErrorHandler.handleDefaultError(err, res);
  }

  /**
   * 🔍 Handle validation errors
   * @param {Error} err - Validation error
   * @param {Object} res - Express response object
   */
  static handleValidationError(err, res) {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return ResponseHelper.validationError(res, errors, 'Validation failed');
  }

  /**
   * 🎯 Handle cast errors (invalid ObjectId, etc.)
   * @param {Error} err - Cast error
   * @param {Object} res - Express response object
   */
  static handleCastError(err, res) {
    const message = `Invalid ${err.path}: ${err.value}`;
    return ResponseHelper.error(res, message, 400);
  }

  /**
   * 🗄️ Handle MongoDB errors
   * @param {Error} err - MongoDB error
   * @param {Object} res - Express response object
   */
  static handleMongoError(err, res) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
      return ResponseHelper.error(res, message, 409);
    }

    return ResponseHelper.error(res, 'Database operation failed', 500);
  }

  /**
   * 🔐 Handle JWT errors
   * @param {Error} err - JWT error
   * @param {Object} res - Express response object
   */
  static handleJWTError(err, res) {
    return ResponseHelper.unauthorized(res, 'Invalid authentication token');
  }

  /**
   * ⏰ Handle token expired errors
   * @param {Error} err - Token expired error
   * @param {Object} res - Express response object
   */
  static handleTokenExpiredError(err, res) {
    return ResponseHelper.unauthorized(res, 'Authentication token has expired');
  }

  /**
   * 📁 Handle file size errors
   * @param {Error} err - File size error
   * @param {Object} res - Express response object
   */
  static handleFileSizeError(err, res) {
    return ResponseHelper.error(res, 'File size too large. Maximum size allowed is 5MB', 413);
  }

  /**
   * 🎯 Handle default errors
   * @param {Error} err - Error object
   * @param {Object} res - Express response object
   */
  static handleDefaultError(err, res) {
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Something went wrong on our end' 
      : err.message;

    return ResponseHelper.error(res, message, statusCode);
  }

  /**
   * 🚫 Handle 404 errors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handleNotFound(req, res, next) {
    const message = `Route ${req.originalUrl} not found`;
    Logger.warn(`🚫 404 Error: ${message}`);
    return ResponseHelper.notFound(res, message);
  }

  /**
   * 🎨 Async error wrapper
   * @param {Function} fn - Async function to wrap
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * 🔒 Handle rate limiting errors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static handleRateLimit(req, res) {
    Logger.warn(`🚦 Rate limit exceeded for IP: ${req.ip}`);
    return ResponseHelper.error(res, 'Too many requests, please try again later', 429);
  }

  /**
   * 🎯 Handle CORS errors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static handleCORS(req, res) {
    Logger.warn(`🌐 CORS error for origin: ${req.get('Origin')}`);
    return ResponseHelper.error(res, 'CORS policy violation', 403);
  }
}

module.exports = BeautifulErrorHandler;
