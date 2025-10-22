import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { safeDispatchWithDelays } from "../utils/reduxUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// Removed getProfilePictureUrl import - now using profilePictureUrl directly
import ProfilePictureModal from "../components/shared/ProfilePictureModal";
import ThemeToggle from "../components/shared/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrency } from "../contexts/CurrencyContext";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Palette,
  Wallet,
  Smartphone,
  Mail,
  MapPin,
  Save,
  Edit3,
  Camera,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Key,
  Smartphone as PhoneIcon,
  Check,
  X,
  Loader2,
  RefreshCw,
  HelpCircle,
  FileText,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import {
  updateSettings,
  updateNotifications,
  updatePrivacy,
  updateNotificationPreference,
  updatePrivacyPreference,
  testNotificationPreferences,
} from "../redux/slices/settingsSlice";
import { logout, fetchProfile } from "../redux/slices/authSlice";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const {
    settings,
    notifications: notificationSettings,
    privacy: privacySettings,
  } = useSelector((state) => state.settings);

  // Local state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showLogoutConfirmDialog, setShowLogoutConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState({
    name:
      user?.role === "logistics" ? user?.companyName || "" : user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || user?.phone || "", // Map phoneNumber to phone
    country: user?.address || "", // Map address to country
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form errors
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name:
          user?.role === "logistics"
            ? user?.companyName || ""
            : user?.name || "",
        email: user?.email || "",
        phone: user?.phoneNumber || user?.phone || "", // Map phoneNumber to phone
        country: user?.address || "", // Map address to country
      });
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    // Validate form
    const errors = {};
    if (!profileData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!profileData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = "Email is invalid";
    }

    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Map frontend field names to backend field names
      const backendData = {
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phone, // Map phone to phoneNumber
        address: profileData.country, // Map country to address
      };

      await dispatch(updateSettings(backendData)).unwrap();
      // Refresh user profile data to get updated values
      await dispatch(fetchProfile()).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    // Validate form
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Send password fields at root level, not nested under password
      const passwordUpdateData = {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword, // Backend expects 'password' for new password
      };

      await dispatch(updateSettings(passwordUpdateData)).unwrap();
      toast.success("Password updated successfully!");
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = async (key) => {
    if (!notificationSettings) return;

    const newValue = !notificationSettings[key];

    try {
      // Update the backend
      await dispatch(updateNotifications({ [key]: newValue })).unwrap();

      // Update local state
      dispatch(updateNotificationPreference({ key, value: newValue }));

      toast.success(
        `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${
          newValue ? "enabled" : "disabled"
        }`
      );
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast.error(`Failed to update ${key} notification preference`);
    }
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (key) => {
    if (!privacySettings) return;

    const newValue = !privacySettings[key];
    dispatch(updatePrivacyPreference({ key, value: newValue }));
    dispatch(updatePrivacy({ [key]: newValue }));
    toast.success(
      `${key.charAt(0).toUpperCase() + key.slice(1)} visibility ${
        newValue ? "enabled" : "disabled"
      }`
    );
  };

  // Handle test notification
  const handleTestNotification = async (type, channel) => {
    try {
      const result = await dispatch(
        testNotificationPreferences({ type, channel })
      ).unwrap();

      if (result.success) {
        toast.success(`Test ${channel} notification sent successfully!`);
      } else {
        toast.error(
          `Failed to send test ${channel} notification: ${result.message}`
        );
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error(`Failed to send test ${channel} notification`);
    }
  };

  // Profile picture handlers
  const handleProfilePictureUpload = async (file) => {
    try {
      // Validate file
      if (!file) {
        console.error("❌ No file selected");
        toast.error("No file selected");
        return;
      }

      if (!file.type.startsWith("image/")) {
        console.error("❌ Invalid file type:", file.type);
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.error("❌ File too large:", file.size);
        toast.error("File size must be less than 5MB");
        return;
      }

      console.log("✅ File validation passed:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      // Create FormData
      const formData = new FormData();
      formData.append("profilePicture", file);

      console.log("📤 Uploading profile picture...");

      // Upload to backend
      const response = await fetch("/api/users/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Upload failed:", errorData);
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      console.log("✅ Upload successful:", result);

      // Update user state
      dispatch({
        type: "auth/updateUser",
        payload: { profilePictureUrl: result.profilePictureUrl },
      });

      toast.success("Profile picture updated successfully!");
      setShowProfilePictureModal(false);
    } catch (error) {
      console.error("❌ Profile picture upload error:", error);
      toast.error(`Failed to upload profile picture: ${error.message}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setShowLogoutConfirmDialog(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await dispatch(updateSettings({ deleteAccount: true })).unwrap();
      toast.success("Account deleted successfully");
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setShowDeleteConfirmDialog(false);
    }
  };

  // Handle currency change with toast
  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    toast.success(`Currency changed to ${newCurrency}`);
  };

  // Settings sections
  const settingsSections = [
    {
      id: "profile",
      title: "Profile",
      icon: User,
      description: "Manage your personal information",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Control your notification preferences",
    },
    {
      id: "privacy",
      title: "Privacy",
      icon: Shield,
      description: "Manage your privacy settings",
    },
    {
      id: "security",
      title: "Security",
      icon: Lock,
      description: "Password and security settings",
    },
    {
      id: "preferences",
      title: "Preferences",
      icon: SettingsIcon,
      description: "Theme, currency, and app preferences",
    },
    {
      id: "support",
      title: "Support & Legal",
      icon: HelpCircle,
      description: "Contact, help, and legal information",
    },
  ];

  const [activeSection, setActiveSection] = useState("profile");

  const renderProfileSection = () => {
    return (
      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={user?.profilePictureUrl || "/default-avatar.svg"}
              alt="Profile"
              onError={(e) => {
                console.error(
                  "❌ SettingsPage - Image failed to load:",
                  e.target.src
                );
                console.error(
                  "❌ SettingsPage - User profilePictureUrl:",
                  user?.profilePictureUrl
                );
                console.error(
                  "❌ SettingsPage - User profilePicture:",
                  user?.profilePicture
                );
                e.currentTarget.src = "/default-avatar.svg";
              }}
              onLoad={() => {
                console.log(
                  "✅ SettingsPage - Image loaded successfully:",
                  user?.profilePictureUrl || "/default-avatar.svg"
                );
              }}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
            />
            <button
              onClick={() => setShowProfilePictureModal(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.role === "logistics" ? user?.companyName : user?.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <button
              onClick={() => setShowProfilePictureModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Change Photo
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {user?.role === "logistics" ? "Company Name" : "Full Name"}
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              disabled={!isEditingProfile}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
                profileErrors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {profileErrors.name && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              disabled={!isEditingProfile}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
                profileErrors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              disabled={!isEditingProfile}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={profileData.country}
              onChange={(e) =>
                setProfileData({ ...profileData, country: e.target.value })
              }
              disabled={!isEditingProfile}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {isEditingProfile ? (
            <>
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileErrors({});
                  // Reset form data
                  setProfileData({
                    name:
                      user?.role === "logistics"
                        ? user?.companyName || ""
                        : user?.name || "",
                    email: user?.email || "",
                    phone: user?.phoneNumber || user?.phone || "", // Map phoneNumber to phone
                    country: user?.address || "", // Map address to country
                  });
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      {Object.keys(notificationSettings || {}).length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Notification Settings Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Notification settings will appear here once they are loaded.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(notificationSettings || {}).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {key === "email" && "Receive email notifications"}
                    {key === "push" && "Receive push notifications"}
                    {key === "sms" && "Receive SMS notifications"}
                    {key === "marketing" && "Receive marketing emails"}
                    {key === "security" && "Receive security alerts"}
                    {key === "updates" && "Receive app updates"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      {Object.keys(privacySettings || {}).length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Privacy Settings Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Privacy settings will appear here once they are loaded.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(privacySettings || {}).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {key === "profileVisibility" &&
                      "Make your profile visible to others"}
                    {key === "activityStatus" && "Show when you're online"}
                    {key === "dataSharing" &&
                      "Allow data sharing for analytics"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePrivacyToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Update your password for better security
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingPassword(!isEditingPassword)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {isEditingPassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        {isEditingPassword && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  passwordErrors.currentPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  passwordErrors.newPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  passwordErrors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsEditingPassword(false);
                  setPasswordErrors({});
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Theme
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose your preferred theme
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Currency Settings - Only for Logistics Users */}
      {user?.role === "logistics" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Currency
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select your preferred currency
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["USD", "EUR", "GBP", "NGN"].map((curr) => (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  currency === curr
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Currency Info */}
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> Currency changes will apply to all price
              displays throughout the app. Exchange rates are updated regularly
              and are for reference purposes only.
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSupportSection = () => (
    <div className="space-y-6">
      {/* Contact Support */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get help with your account or technical issues
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Contact Us</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help Center */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Help Center
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find answers to frequently asked questions
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/help")}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>Visit Help Center</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terms of Service */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Terms of Service
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Read our terms and conditions
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/terms")}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span>View Terms</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacy Policy
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn how we protect your data
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/privacy")}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span>View Privacy Policy</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "notifications":
        return renderNotificationsSection();
      case "privacy":
        return renderPrivacySection();
      case "security":
        return renderSecuritySection();
      case "preferences":
        return renderPreferencesSection();
      case "support":
        return renderSupportSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm opacity-75">
                          {section.description}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {showProfilePictureModal && (
        <ProfilePictureModal
          isOpen={showProfilePictureModal}
          onClose={() => setShowProfilePictureModal(false)}
          onUpload={handleProfilePictureUpload}
          currentImage={user?.profilePictureUrl}
        />
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete your account? This will
              permanently remove all your data and cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 backdrop-enter">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-200 dark:border-gray-700 modal-enter">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Are you sure?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Do you really want to log out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirmDialog(false)}
                className="flex-1 px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
