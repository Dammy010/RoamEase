import React, { useEffect, useState, useCallback } from "react"; // New: Import useState, useCallback
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// Removed: import Sidebar from "../../components/shared/Sidebar";
import {
  FaTruck,
  FaFileUpload,
  FaList,
  FaComments,
  FaUserCircle,
  FaWallet,
  FaRedo,
  FaHistory,
} from "react-icons/fa";
import { ArrowRight, Gavel, Package, List, RefreshCw } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";
import { initSocket } from "../../services/socket";
import FullScreenImageViewer from "../../components/shared/FullScreenImageViewer";
import {
  getLogisticsDisplayName,
  getVerificationStatusText,
} from "../../utils/logisticsUtils";
import { fetchProfile } from "../../redux/slices/authSlice";
import {
  fetchLogisticsDashboardData,
  fetchLogisticsHistory,
} from "../../redux/slices/logisticsSlice";
import { getProfilePictureUrl } from "../../utils/imageUtils";
import { useTheme } from "../../contexts/ThemeContext";
import { useCurrency } from "../../contexts/CurrencyContext";

const LogisticsDashboardHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { formatCurrency, currency } = useCurrency();
  const { user } = useSelector((state) => state.auth);
  const {
    dashboardData,
    loading: countsLoading,
    history,
    historyLoading,
    historyError,
  } = useSelector((state) => state.logistics);

  // Fallback data to ensure counts are always shown
  const safeDashboardData = {
    availableShipments: dashboardData?.availableShipments ?? 0,
    myBids: dashboardData?.myBids ?? 0,
    activeShipments: dashboardData?.activeShipments ?? 0,
    ...dashboardData,
  };

  const [showProfilePicModal, setShowProfilePicModal] = useState(false);

  // Function to refresh user profile data
  const handleRefreshProfile = () => {
    dispatch(fetchProfile());
  };

  // Function to refresh dashboard data
  const handleRefreshDashboard = useCallback(() => {
    if (user) {
      dispatch(fetchLogisticsDashboardData());
      dispatch(fetchLogisticsHistory());
    }
  }, [dispatch, user]);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    if (user) {
      // Always fetch fresh data on mount
      dispatch(fetchLogisticsDashboardData());
      dispatch(fetchLogisticsHistory());
    }
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
          <button
            onClick={handleRefreshProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // Use real logistics user info from Redux with utility functions
  const logisticsUser = {
    name: getLogisticsDisplayName(user) || "Logistics Partner",
    role: getVerificationStatusText(user) || "Partner",
    avatar: getProfilePictureUrl(user?.profilePicture),
  };

  const modules = [
    {
      name: "Available Shipments",
      description: "Browse and accept available shipment jobs.",
      icon: <Package size={28} />,
      color: "from-green-500 to-green-600",
      path: "/logistics/available-shipments",
      notification: safeDashboardData.availableShipments,
    },
    {
      name: "My Bids",
      description: "View and manage your submitted bids.",
      icon: <Gavel size={28} />,
      color: "from-blue-500 to-blue-600",
      path: "/logistics/my-bids",
      notification: safeDashboardData.myBids,
    },
    {
      name: "Active Shipments",
      description: "Track your ongoing shipments.",
      icon: <List size={28} />,
      color: "from-purple-500 to-purple-600",
      path: "/logistics/active-shipments",
      notification: safeDashboardData.activeShipments,
    },
  ];

  // Simple fallback to ensure something renders
  if (!logisticsUser || !logisticsUser.name) {
    return (
      <div className="p-6 md:p-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Logistics Dashboard
          </h2>
          <p className="text-gray-600 mb-4">Loading user data...</p>
          <button
            onClick={handleRefreshProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Profile Data
          </button>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-sm text-gray-700">
              {JSON.stringify({ user: user, logisticsUser }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <section className="relative overflow-hidden bg-blue-600 rounded-2xl shadow-lg mb-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left Content */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <FaTruck className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold">
                      Welcome back, {logisticsUser.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm font-medium">
                        ✓ {logisticsUser.role}
                      </span>
                      {user?.role === "logistics" && user?.companyName && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium">
                          🏢 {user.companyName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-blue-100 text-sm mb-4 max-w-2xl leading-relaxed">
                  Manage your logistics operations efficiently. Track shipments,
                  place bids, and grow your business with our comprehensive
                  platform.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRefreshDashboard}
                    disabled={countsLoading}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        countsLoading ? "animate-spin" : ""
                      }`}
                    />
                    {countsLoading ? "Refreshing..." : "Refresh Data"}
                  </button>
                  <button
                    onClick={handleRefreshProfile}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20 text-sm"
                  >
                    <FaRedo className="w-4 h-4" />
                    Refresh Profile
                  </button>
                  <button
                    onClick={() => navigate("/logistics/available-shipments")}
                    className="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-blue-50 transition-all duration-300 font-medium shadow-md text-sm"
                  >
                    Browse Shipments
                  </button>
                </div>
              </div>

              {/* Right Content - Avatar and Notifications */}
              <div className="flex-shrink-0 flex items-center gap-6">
                {/* Notification Bell */}
                <div className="relative">
                  <NotificationBell />
                </div>

                {/* Avatar */}
                <div className="relative">
                  {logisticsUser.avatar ? (
                    <img
                      src={logisticsUser.avatar}
                      alt="Logistics Partner Avatar"
                      className="w-20 h-20 rounded-xl border-4 border-white/30 object-cover cursor-pointer shadow-lg hover:scale-105 transition-transform duration-300"
                      onClick={() => setShowProfilePicModal(true)}
                      onError={(e) => {
                        console.error(
                          "Profile picture failed to load:",
                          e.target.src
                        );
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}

                  {/* Fallback avatar */}
                  <div
                    className={`w-20 h-20 rounded-xl border-4 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
                      logisticsUser.avatar ? "hidden" : "flex"
                    }`}
                    style={{ display: logisticsUser.avatar ? "none" : "flex" }}
                  >
                    {logisticsUser.name
                      ? logisticsUser.name[0].toUpperCase()
                      : "L"}
                  </div>

                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Quick Actions
            </h2>
            <p className="text-gray-600 text-sm">
              Access your most important features and tools
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, idx) => (
              <div
                key={idx}
                onClick={() => navigate(mod.path)}
                className="group relative cursor-pointer p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:border-blue-200 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Count Badge */}
                {mod.notification > 0 && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {mod.notification}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                    {mod.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                      {mod.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {mod.description}
                    </p>
                    <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors duration-300">
                      <span>Access Module</span>
                      <ArrowRight
                        size={16}
                        className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery History Section */}
        <section className="mt-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <FaHistory className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Recent Delivery History
                    </h2>
                    <p className="text-indigo-100">
                      Track your completed deliveries and performance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <span className="text-white font-semibold">
                      {historyLoading
                        ? "Loading..."
                        : `${history.length} deliveries`}
                    </span>
                  </div>
                  <button
                    onClick={() => dispatch(fetchLogisticsHistory())}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                  >
                    <FaRedo size={14} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">
                      Loading delivery history...
                    </p>
                  </div>
                </div>
              ) : historyError ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-500 text-xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Error Loading History
                  </h3>
                  <p className="text-gray-600 mb-6">{historyError}</p>
                  <button
                    onClick={() => dispatch(fetchLogisticsHistory())}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📦</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    No Delivery History Yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't completed any deliveries yet. Start by browsing
                    available shipments and place your first bid!
                  </p>
                  <button
                    onClick={() => navigate("/logistics/available-shipments")}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg"
                  >
                    Browse Available Shipments
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.slice(0, 5).map((shipment, index) => (
                    <div
                      key={shipment._id}
                      className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                              📦
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                              {shipment.shipmentTitle}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {shipment.pickupCity}, {shipment.pickupCountry} →{" "}
                              {shipment.deliveryCity},{" "}
                              {shipment.deliveryCountry}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                {shipment.user?.companyName ||
                                  shipment.user?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                {new Date(
                                  shipment.updatedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {formatCurrency(
                                shipment.bid?.price || 0,
                                shipment.bid?.currency || "USD",
                                currency
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              Your Bid
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                              shipment.status === "completed" ||
                              shipment.status === "delivered"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {shipment.status.charAt(0).toUpperCase() +
                              shipment.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {history.length > 5 && (
                    <div className="text-center pt-6">
                      <button
                        onClick={() => navigate("/logistics/history")}
                        className="px-8 py-3 bg-blue-100 text-gray-700 rounded-xl hover:bg-blue-200 transition-all duration-300 font-semibold shadow-lg"
                      >
                        View All {history.length} Deliveries
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Full Screen Image Viewer */}
        {showProfilePicModal && (
          <FullScreenImageViewer
            isOpen={showProfilePicModal}
            onClose={() => setShowProfilePicModal(false)}
            imageUrl={logisticsUser.avatar}
            alt="Profile Picture"
          />
        )}
      </div>
    </div>
  );
};

export default LogisticsDashboardHome;
