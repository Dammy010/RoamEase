import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../contexts/ThemeContext";
import { getProfilePictureUrl } from "../utils/imageUtils";
import FullScreenImageViewer from "../components/shared/FullScreenImageViewer";
import { ProfilePictureModal } from "../components/forms/ProfileForm";
import ConfirmationDialog from "../components/shared/ConfirmationDialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Camera,
  Upload,
  CheckCircle,
  Award,
  Star,
  Package,
  Truck,
  Clock,
  Globe,
  Shield,
  Settings,
  Bell,
  CreditCard,
  LogOut,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  changePassword,
  deleteAccount,
  getProfileStats,
  clearProfileError,
  uploadProfilePicture,
} from "../redux/slices/profileSlice";
import { fetchProfile } from "../redux/slices/authSlice";
import { useSelector as useSettingsSelector } from "react-redux";
import { getSocket } from "../services/socket";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const authState = useSelector((state) => state.auth);
  const { user } = authState;

  const {
    stats,
    loading,
    statsLoading,
    error,
    passwordLoading,
    uploadLoading,
    deleteLoading,
  } = useSelector((state) => state.profile);

  // Get privacy settings
  const { privacy: privacySettings } = useSettingsSelector(
    (state) => state.settings
  );

  // Confirmation dialog states
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Load profile stats on mount - only for logistics users
  useEffect(() => {
    if (user && user.role === "logistics") {
      dispatch(getProfileStats());
    }
  }, [user, dispatch]);

  // Listen for verification updates
  useEffect(() => {
    if (user?.role === "logistics") {
      const socket = getSocket();

      const handleVerificationUpdate = (updatedUser) => {
        if (updatedUser._id === user._id) {
          // Refresh the user profile to get updated verification status
          dispatch(fetchProfile());
        }
      };

      socket.on("verification-updated", handleVerificationUpdate);

      return () => {
        socket.off("verification-updated", handleVerificationUpdate);
      };
    }
  }, [user, dispatch]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearProfileError());
    };
  }, [dispatch]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      );

      if (changePassword.fulfilled.match(result)) {
        toast.success("Password changed successfully");
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else if (changePassword.rejected.match(result)) {
        toast.error(result.payload || "Failed to change password");
      }
    } catch (error) {
      toast.error("An error occurred while changing password");
    }
  };

  const handleDeleteAccount = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password to delete account");
      return;
    }

    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const result = await dispatch(
        deleteAccount(passwordData.currentPassword)
      );
      if (deleteAccount.fulfilled.match(result)) {
        toast.success("Account deleted successfully");
        // User will be redirected by the auth system
      } else if (deleteAccount.rejected.match(result)) {
        toast.error(result.payload || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An error occurred while deleting account");
    }
    setShowDeleteConfirmDialog(false);
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      const result = await dispatch(uploadProfilePicture(file));
      if (uploadProfilePicture.fulfilled.match(result)) {
        toast.success("Profile picture updated successfully");
        // Refresh user profile to get updated picture
        dispatch(fetchProfile());
        setShowProfilePictureModal(false);
      } else if (uploadProfilePicture.rejected.match(result)) {
        toast.error(result.payload || "Failed to update profile picture");
      }
    } catch (error) {
      toast.error("An error occurred while uploading profile picture");
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role) => {
    return role === "logistics" ? Truck : Package;
  };

  const getRoleColor = (role) => {
    return role === "logistics" ? "bg-blue-500" : "bg-blue-500";
  };

  const getVerificationStatus = () => {
    if (user?.role === "logistics") {
      // Check both verificationStatus and isVerified fields
      const isVerified =
        user?.verificationStatus === "verified" || user?.isVerified === true;
      return isVerified ? "Verified" : "Pending Verification";
    }
    return "Verified";
  };

  const getVerificationColor = () => {
    if (user?.role === "logistics") {
      // Check both verificationStatus and isVerified fields
      const isVerified =
        user?.verificationStatus === "verified" || user?.isVerified === true;
      return isVerified ? "text-green-600" : "text-yellow-600";
    }
    return "text-green-600";
  };

  // Show loading state if no user and loading
  if (!user && loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user and error
  if (!user && error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Please Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to be logged in to view your profile.
          </p>
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show fallback if user data is incomplete
  if (!user.email) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Profile Data Incomplete
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please refresh the page or log in again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your profile information and account settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Edit Profile in Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block group">
                  {(() => {
                    const hasProfilePicture =
                      user?.profilePictureUrl || user?.profilePicture;
                    return hasProfilePicture;
                  })() ? (
                    <img
                      src={
                        user?.profilePictureUrl ||
                        getProfilePictureUrl(user.profilePicture)
                      }
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover shadow-lg cursor-pointer hover:opacity-80 transition-opacity border-4 border-white dark:border-gray-700"
                      onClick={() => setShowFullScreenImage(true)}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                      onLoad={() => {
                        // Image loaded successfully
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-28 h-28 ${getRoleColor(
                      user?.role
                    )} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg cursor-pointer hover:opacity-80 transition-opacity border-4 border-white dark:border-gray-700 ${
                      user?.profilePictureUrl || user?.profilePicture
                        ? "hidden"
                        : ""
                    }`}
                    onClick={() => setShowFullScreenImage(true)}
                  >
                    {getInitials(user?.name || user?.companyName || "User")}
                  </div>
                  {uploadLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                  {user?.role === "logistics"
                    ? user?.companyName || "Company Name"
                    : user?.name || "User Name"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {user?.role === "logistics"
                    ? "Logistics Provider"
                    : "Shipper"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getVerificationColor()}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {getVerificationStatus()}
                  </div>
                  {user?.role === "logistics" && (
                    <button
                      onClick={() => dispatch(fetchProfile())}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Refresh verification status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              {user?.role === "logistics" && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Rating
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-8 rounded"></div>
                      ) : (
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.rating > 0 ? stats.rating : "No ratings yet"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Success Rate
                    </span>
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-12 rounded"></div>
                    ) : (
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.successRate}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Response Time
                    </span>
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
                    ) : (
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.responseTime}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                <Link
                  to="/settings"
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/notifications"
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </Link>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Change Password</span>
                </button>
                <Link
                  to="/billing"
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Billing</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update your personal details and contact information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {user?.role === "logistics" ? "Company Name" : "Full Name"}
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {user?.role === "logistics"
                      ? user?.companyName || "N/A"
                      : user?.name || "N/A"}
                  </div>
                </div>

                {privacySettings?.showEmail !== false && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.email || "N/A"}
                    </div>
                  </div>
                )}

                {privacySettings?.showPhone !== false && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {user?.role === "logistics"
                        ? "Contact Phone"
                        : "Phone Number"}
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.role === "logistics"
                        ? user?.contactPhone || "N/A"
                        : user?.phoneNumber || "N/A"}
                    </div>
                  </div>
                )}

                {privacySettings?.showLocation !== false && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                        {user?.country || user?.address || "N/A"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Company Information (for logistics) */}
            {user?.role === "logistics" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Company Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.companyName || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Registration Number
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.registrationNumber || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Years in Operation
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.yearsInOperation || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Size
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.companySize || "N/A"}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.website ? (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.website}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics - Only for logistics users */}
            {user?.role === "logistics" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Statistics
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your performance metrics and achievements
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(getProfileStats())}
                    disabled={statsLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                    title="Refresh statistics"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${
                        statsLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                {error ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Failed to load statistics
                    </p>
                    <button
                      onClick={() => dispatch(getProfileStats())}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : statsLoading &&
                  !stats.totalShipments &&
                  !stats.completedShipments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading statistics...
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-12 rounded mx-auto mb-2"></div>
                      ) : (
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                          {stats.totalShipments || 0}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Total Bids
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-12 rounded mx-auto mb-2"></div>
                      ) : (
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {stats.completedShipments || 0}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Accepted Bids
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-12 rounded mx-auto mb-2"></div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {stats.rating > 0 ? stats.rating : "N/A"}
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Rating
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-12 rounded mx-auto mb-2"></div>
                      ) : (
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                          {stats.successRate || 0}%
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Success Rate
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password Change Form */}
            {showPasswordForm && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      disabled={passwordLoading}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={passwordLoading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account Section */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Danger Zone
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {showProfilePictureModal && (
        <ProfilePictureModal
          imageUrl={
            user?.profilePictureUrl ||
            getProfilePictureUrl(user?.profilePicture)
          }
          onClose={() => setShowProfilePictureModal(false)}
          onUpload={handleProfilePictureUpload}
          uploadLoading={uploadLoading}
        />
      )}

      {/* Full Screen Image Viewer */}
      {showFullScreenImage && (
        <FullScreenImageViewer
          isOpen={showFullScreenImage}
          onClose={() => setShowFullScreenImage(false)}
          imageUrl={
            user?.profilePictureUrl ||
            getProfilePictureUrl(user?.profilePicture)
          }
          alt="Profile Picture"
        />
      )}

      {/* Modern Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

// Fallback component in case of any issues
const ProfilePageFallback = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Profile Page
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Loading your profile...
      </p>
    </div>
  </div>
);

// Wrap the main component with error boundary
const ProfilePageWithErrorBoundary = () => {
  try {
    return <ProfilePage />;
  } catch (error) {
    console.error("ProfilePage Error:", error);
    return <ProfilePageFallback />;
  }
};

// Export the main component with error boundary
export default ProfilePageWithErrorBoundary;
