/**
 * 🎨 Beautiful Logger Utility
 * Provides colorful, structured logging with different levels and formatting
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

class Logger {
  /**
   * 🎨 Format timestamp
   */
  static getTimestamp() {
    return new Date().toISOString().replace('T', ' ').replace('Z', '');
  }

  /**
   * 🎨 Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {string} color - Color for the level
   */
  static formatMessage(level, message, data = null, color = colors.white) {
    const timestamp = this.getTimestamp();
    const levelFormatted = `${color}${colors.bright}[${level.toUpperCase()}]${colors.reset}`;
    const timestampFormatted = `${colors.dim}${timestamp}${colors.reset}`;
    
    let logMessage = `${levelFormatted} ${timestampFormatted} ${message}`;
    
    if (data) {
      logMessage += `\n${colors.cyan}📊 Data:${colors.reset} ${JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  /**
   * ✅ Info log
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  static info(message, data = null) {
    console.log(this.formatMessage('info', message, data, colors.blue));
  }

  /**
   * ✅ Success log
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  static success(message, data = null) {
    console.log(this.formatMessage('success', message, data, colors.green));
  }

  /**
   * ⚠️ Warning log
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  static warn(message, data = null) {
    console.log(this.formatMessage('warn', message, data, colors.yellow));
  }

  /**
   * ❌ Error log
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  static error(message, data = null) {
    console.log(this.formatMessage('error', message, data, colors.red));
  }

  /**
   * 🔍 Debug log
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('debug', message, data, colors.magenta));
    }
  }

  /**
   * 🚀 Request log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? colors.red : 
                         res.statusCode >= 300 ? colors.yellow : colors.green;
      
      const methodColor = {
        'GET': colors.blue,
        'POST': colors.green,
        'PUT': colors.yellow,
        'DELETE': colors.red,
        'PATCH': colors.magenta
      }[req.method] || colors.white;
      
      const method = `${methodColor}${req.method}${colors.reset}`;
      const status = `${statusColor}${res.statusCode}${colors.reset}`;
      const durationFormatted = `${colors.cyan}${duration}ms${colors.reset}`;
      
      console.log(`${method} ${req.originalUrl} ${status} ${durationFormatted}`);
    });
    
    next();
  }

  /**
   * 🎯 Database operation log
   * @param {string} operation - Database operation
   * @param {string} collection - Collection name
   * @param {*} data - Operation data
   */
  static db(operation, collection, data = null) {
    const message = `🗄️  Database ${operation} on ${collection}`;
    this.info(message, data);
  }

  /**
   * 🔐 Authentication log
   * @param {string} action - Auth action
   * @param {string} user - User identifier
   * @param {*} data - Additional data
   */
  static auth(action, user, data = null) {
    const message = `🔐 Authentication ${action} for user: ${user}`;
    this.info(message, data);
  }

  /**
   * 💰 Payment log
   * @param {string} action - Payment action
   * @param {string} amount - Payment amount
   * @param {*} data - Additional data
   */
  static payment(action, amount, data = null) {
    const message = `💰 Payment ${action}: $${amount}`;
    this.info(message, data);
  }

  /**
   * 🚚 Shipment log
   * @param {string} action - Shipment action
   * @param {string} shipmentId - Shipment ID
   * @param {*} data - Additional data
   */
  static shipment(action, shipmentId, data = null) {
    const message = `🚚 Shipment ${action}: ${shipmentId}`;
    this.info(message, data);
  }

  /**
   * 💬 Chat log
   * @param {string} action - Chat action
   * @param {string} conversationId - Conversation ID
   * @param {*} data - Additional data
   */
  static chat(action, conversationId, data = null) {
    const message = `💬 Chat ${action}: ${conversationId}`;
    this.info(message, data);
  }

  /**
   * 🎨 Beautiful startup banner
   */
  static startupBanner() {
    const banner = `
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  🚀 RoamEase Backend Server                                  ║
║                                                              ║
║  ✨ Beautiful • Fast • Reliable                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`;
    
    console.log(banner);
    this.success('🚀 Server starting up...');
    this.info(`📅 Started at: ${this.getTimestamp()}`);
    this.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    this.info(`🔗 Port: ${process.env.PORT || 5000}`);
  }
}

module.exports = Logger;
