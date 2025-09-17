// Utility functions for logistics dashboard

/**
 * Get the display name for a logistics user
 * @param {Object} user - User object from Redux state
 * @returns {string} Display name (company name, contact name, or fallback)
 */
export const getLogisticsDisplayName = (user) => {
  if (!user) return "Unknown User";
  
  if (user.role === "logistics") {
    return user.companyName || user.contactName || user.name || "Your Company Name";
  }
  
  return user.name || "User";
};

/**
 * Get the verification status display text
 * @param {Object} user - User object from Redux state
 * @returns {string} Verification status text
 */
export const getVerificationStatusText = (user) => {
  if (!user) return "Unknown";
  
  if (user.role === "logistics") {
    if (user.verificationStatus === 'verified' || user.isVerified) {
      return "Verified Partner";
    }
    return "Pending Verification";
  }
  
  return user.role || "User";
};

/**
 * Get the verification status color class
 * @param {Object} user - User object from Redux state
 * @returns {string} Tailwind CSS color class
 */
export const getVerificationStatusColor = (user) => {
  if (!user) return "text-gray-500";
  
  if (user.role === "logistics") {
    if (user.verificationStatus === 'verified' || user.isVerified) {
      return "text-green-600";
    }
    return "text-yellow-600";
  }
  
  return "text-gray-600";
};

/**
 * Check if a user is a verified logistics partner
 * @param {Object} user - User object from Redux state
 * @returns {boolean} True if verified logistics partner
 */
export const isVerifiedLogisticsPartner = (user) => {
  if (!user || user.role !== "logistics") return false;
  return user.verificationStatus === 'verified' || user.isVerified;
};

