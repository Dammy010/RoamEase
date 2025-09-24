// Utility functions for handling image URLs

/**
 * Get the full URL for a profile picture
 * @param {string} profilePicture - The profile picture filename or path
 * @returns {string|null} - The full URL or null if no picture
 */
export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture || typeof profilePicture !== "string") {
    return null;
  }

  // If it's already a full URL, return as is
  if (profilePicture.startsWith("http")) {
    return profilePicture;
  }

  // Get the backend base URL
  const backendBaseUrl =
    process.env.NODE_ENV === "production"
      ? "https://roamease-3wg1.onrender.com"
      : "http://localhost:5000";

  // Normalize the path - remove any leading slashes and normalize separators
  let cleanPath = profilePicture.replace(/\\/g, "/").replace(/^\/+/, "");
  // If the path already includes 'uploads/profiles/', use it directly
  if (cleanPath.startsWith("uploads/profiles/")) {
    const finalUrl = `${backendBaseUrl}/${cleanPath}`;
    return finalUrl;
  }

  // If the path starts with 'uploads/' but not 'uploads/profiles/', assume it's in profiles
  if (cleanPath.startsWith("uploads/")) {
    const finalUrl = `${backendBaseUrl}/uploads/profiles/${cleanPath.replace(
      "uploads/",
      ""
    )}`;
    return finalUrl;
  }

  // If it's just a filename, assume it's in the profiles directory
  const finalUrl = `${backendBaseUrl}/uploads/profiles/${cleanPath}`;
  return finalUrl;
};

/**
 * Get the full URL for any static asset
 * @param {string} assetPath - The asset path
 * @returns {string|null} - The full URL or null if no path
 */
export const getStaticAssetUrl = (assetPath) => {
  if (!assetPath) return null;

  // If it's already a full URL (Cloudinary or other), return as is
  if (assetPath.startsWith("http")) {
    console.log("🔍 getStaticAssetUrl - Already full URL:", assetPath);
    return assetPath;
  }

  // Get the backend base URL
  const backendBaseUrl =
    process.env.NODE_ENV === "production"
      ? "https://roamease-3wg1.onrender.com"
      : "http://localhost:5000";

  // Normalize path separators and construct full URL
  // Remove any leading slashes and normalize separators
  let cleanPath = assetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  console.log("🔍 getStaticAssetUrl - Original path:", assetPath);
  console.log("🔍 getStaticAssetUrl - Cleaned path:", cleanPath);
  console.log("🔍 getStaticAssetUrl - Final URL:", `${backendBaseUrl}/${cleanPath}`);
  return `${backendBaseUrl}/${cleanPath}`;
};
