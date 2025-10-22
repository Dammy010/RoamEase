// Utility functions for handling image URLs

/**
 * Get the Cloudinary base URL
 * @returns {string} - The cloudinary base URL
 */
const getCloudinaryBaseUrl = () => {
  // Use the cloud name from environment or fallback to the one in .env
  const cloudName =
    import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME ||
    (typeof process !== "undefined" &&
      process.env?.REACT_APP_CLOUDINARY_CLOUD_NAME) ||
    "db6qlljkd";
  return `https://res.cloudinary.com/${cloudName}/image/upload`;
};

/**
 * Get the full URL for a profile picture
 * @param {string} profilePicture - The profile picture filename or path
 * @returns {string|null} - The full URL or null if no picture
 */
export const getProfilePictureUrl = (profilePicture) => {
  console.log("🔍 getProfilePictureUrl called with:", profilePicture);

  if (!profilePicture || typeof profilePicture !== "string") {
    console.log("❌ getProfilePictureUrl: Invalid input");
    return null;
  }

  // If it's already a full URL, return as is
  if (profilePicture.startsWith("http")) {
    console.log("✅ getProfilePictureUrl: Already full URL:", profilePicture);
    return profilePicture;
  }

  // Check if it's a cloudinary public ID
  const isCloudinaryPublicId = (filename) => {
    // Cloudinary public IDs have specific patterns:
    // 1. They often contain folder structure (e.g., "roamease/profiles/abc123")
    // 2. They may not have file extensions
    // 3. They contain alphanumeric characters, underscores, hyphens
    // 4. They don't start with timestamps (unlike local files)

    // Check for folder structure (most reliable indicator)
    if (filename.includes("/") && !filename.startsWith("uploads/")) {
      return true;
    }

    // Check if it's a typical cloudinary ID (no timestamp prefix, no spaces)
    const hasTimestampPrefix = /^\d{13}-/.test(filename); // Local files start with timestamp
    const hasSpaces = filename.includes(" ");
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(filename);

    // Special case: if it has a timestamp prefix but no file extension, it might be a cloudinary ID
    // Cloudinary sometimes generates IDs like "1759059152631-20250109_125145" without extension
    if (hasTimestampPrefix && !hasFileExtension && !hasSpaces) {
      // Check if it looks like a cloudinary-generated ID (timestamp + underscore + more chars)
      const cloudinaryPattern = /^\d{13}-[a-zA-Z0-9_-]+$/;
      if (cloudinaryPattern.test(filename)) {
        return true;
      }
    }

    // If it doesn't have timestamp prefix, spaces, or file extension, likely cloudinary
    if (!hasTimestampPrefix && !hasSpaces && !hasFileExtension) {
      return true;
    }

    return false;
  };

  // Get the backend base URL
  const backendBaseUrl = (() => {
    if (
      window.location.hostname === "roam-ease.vercel.app" ||
      window.location.hostname === "roamease-3wg1.onrender.com" ||
      (window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1")
    ) {
      return "https://roamease-3wg1.onrender.com";
    }
    return "http://localhost:5000";
  })();

  // Handle cloudinary public IDs
  if (isCloudinaryPublicId(profilePicture)) {
    console.log(`🔍 Cloudinary public ID detected: ${profilePicture}`);

    // Construct cloudinary URL
    const cloudinaryBaseUrl = getCloudinaryBaseUrl();
    const cloudinaryUrl = `${cloudinaryBaseUrl}/${profilePicture}`;

    console.log(`🔍 Cloudinary URL constructed: ${cloudinaryUrl}`);
    console.log(`🔍 Cloudinary base URL: ${cloudinaryBaseUrl}`);
    return cloudinaryUrl;
  }

  // Special case: Check if this is a Cloudinary upload that failed to be detected
  // If the file doesn't exist locally but has a timestamp pattern, it might be in Cloudinary
  if (/^\d{13}-/.test(profilePicture) && profilePicture.includes("-")) {
    console.log(
      `🔍 Potential Cloudinary file detected (timestamp pattern): ${profilePicture}`
    );

    // Try different Cloudinary URL structures
    const cloudinaryBaseUrl = getCloudinaryBaseUrl();

    // Option 1: With folder structure (most likely based on backend config)
    const cloudinaryUrl1 = `${cloudinaryBaseUrl}/roamease/profiles/${profilePicture}`;
    console.log(`🔍 Attempting Cloudinary URL (folder): ${cloudinaryUrl1}`);

    // Option 2: Direct public ID
    const cloudinaryUrl2 = `${cloudinaryBaseUrl}/${profilePicture}`;
    console.log(`🔍 Attempting Cloudinary URL (direct): ${cloudinaryUrl2}`);

    // Return the folder URL first (most likely based on backend configuration)
    return cloudinaryUrl1;
  }

  // Handle local file uploads (traditional filename with timestamp)
  console.log(`🔍 Local file detected: ${profilePicture}`);
  console.log(
    `🔍 Debug - hasTimestampPrefix: ${/^\d{13}-/.test(profilePicture)}`
  );
  console.log(
    `🔍 Debug - hasFileExtension: ${/\.[a-zA-Z0-9]+$/.test(profilePicture)}`
  );
  console.log(`🔍 Debug - hasSpaces: ${profilePicture.includes(" ")}`);

  // Normalize the path - remove any leading slashes and normalize separators
  let cleanPath = profilePicture.replace(/\\/g, "/").replace(/^\/+/, "");

  // URL encode the filename to handle spaces and special characters
  const encodedPath = cleanPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  // If the path already includes 'uploads/profiles/', use it directly
  if (cleanPath.startsWith("uploads/profiles/")) {
    const finalUrl = `${backendBaseUrl}/${encodedPath}`;
    console.log(`🔍 Local profile picture URL: ${finalUrl}`);
    return finalUrl;
  }

  // If the path starts with 'uploads/' but not 'uploads/profiles/', assume it's in profiles
  if (cleanPath.startsWith("uploads/")) {
    const finalUrl = `${backendBaseUrl}/uploads/profiles/${encodedPath.replace(
      "uploads/",
      ""
    )}`;
    console.log(`🔍 Local profile picture URL: ${finalUrl}`);
    return finalUrl;
  }

  // If it's just a filename, assume it's in the profiles directory
  const finalUrl = `${backendBaseUrl}/uploads/profiles/${encodedPath}`;
  console.log(`🔍 Local profile picture URL: ${finalUrl}`);
  return finalUrl;
};

/**
 * Get the full URL for any static asset
 * @param {string} assetPath - The asset path
 * @returns {string|null} - The full URL or null if no path
 */
export const getStaticAssetUrl = (assetPath) => {
  console.log("🔍 getStaticAssetUrl called with:", assetPath);

  if (!assetPath) {
    console.log("❌ getStaticAssetUrl: No asset path provided");
    return null;
  }

  // If it's already a full URL (Cloudinary or other), return as is
  if (assetPath.startsWith("http")) {
    console.log("✅ getStaticAssetUrl - Already full URL:", assetPath);
    return assetPath;
  }

  // Get the backend base URL
  const backendBaseUrl = (() => {
    if (
      window.location.hostname === "roam-ease.vercel.app" ||
      window.location.hostname === "roamease-3wg1.onrender.com" ||
      (window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1")
    ) {
      return "https://roamease-3wg1.onrender.com";
    }
    return "http://localhost:5000";
  })();

  // Normalize path separators and construct full URL
  // Remove any leading slashes and normalize separators
  let cleanPath = assetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  console.log("🔍 getStaticAssetUrl - Original path:", assetPath);
  console.log("🔍 getStaticAssetUrl - Cleaned path:", cleanPath);
  console.log(
    "🔍 getStaticAssetUrl - Final URL:",
    `${backendBaseUrl}/${cleanPath}`
  );
  return `${backendBaseUrl}/${cleanPath}`;
};
