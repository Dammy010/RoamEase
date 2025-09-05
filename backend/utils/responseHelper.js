/**
 * 🎨 Beautiful Response Helper
 * Provides consistent, beautiful API responses with proper status codes and formatting
 */

class ResponseHelper {
  /**
   * ✨ Success Response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      status: statusCode
    };

    return res.status(statusCode).json(response);
  }

  /**
   * ❌ Error Response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {*} errors - Additional error details
   */
  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
      status: statusCode
    };

    return res.status(statusCode).json(response);
  }

  /**
   * 🔐 Authentication Error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  /**
   * 🚫 Forbidden Error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * 🔍 Not Found Error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * ⚠️ Validation Error
   * @param {Object} res - Express response object
   * @param {*} errors - Validation errors
   * @param {string} message - Error message
   */
  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, message, 400, errors);
  }

  /**
   * 📄 Paginated Response
   * @param {Object} res - Express response object
   * @param {Array} data - Response data
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    const response = {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
        hasNext: pagination.page < Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString(),
      status: 200
    };

    return res.status(200).json(response);
  }

  /**
   * 🎯 Created Response
   * @param {Object} res - Express response object
   * @param {*} data - Created data
   * @param {string} message - Success message
   */
  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * 🔄 Updated Response
   * @param {Object} res - Express response object
   * @param {*} data - Updated data
   * @param {string} message - Success message
   */
  static updated(res, data, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200);
  }

  /**
   * 🗑️ Deleted Response
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   */
  static deleted(res, message = 'Resource deleted successfully') {
    return this.success(res, null, message, 200);
  }
}

module.exports = ResponseHelper;
