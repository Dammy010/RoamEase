import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// Removed: import Sidebar from "../../components/shared/Sidebar";
import { PlusCircle, Package, MessageSquare, Clock, UserCircle, Truck, MapPin, Calendar, Wallet, TrendingUp, RefreshCw, Eye, ArrowRight } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";
import { initializeSocketAfterLogin } from "../../services/socket";
import { fetchUserShipments, fetchShipmentHistory } from "../../redux/slices/shipmentSlice";
import { fetchProfile } from "../../redux/slices/authSlice";
import FullScreenImageViewer from "../../components/shared/FullScreenImageViewer";
import { getProfilePictureUrl } from "../../utils/imageUtils";
import { useTheme } from "../../contexts/ThemeContext";

const UserDashboardHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const { user } = useSelector((state) => state.auth);
  const { shipments, history, loading, error } = useSelector(
    (state) => state.shipment
  );
  const { unreadCount } = useSelector((state) => state.chat || { unreadCount: 0 });

  const [showProfilePicModal, setShowProfilePicModal] = useState(false);


  useEffect(() => {
    if (user) {
      dispatch(fetchUserShipments());
      dispatch(fetchShipmentHistory());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      const socket = initializeSocketAfterLogin();
      if (socket) {
        socket.emit("user-online", user._id);

        socket.on("new-message", () => {
          // Ideally you'd dispatch an action to update chat unread count
        });

        // Listen for notification refresh events
        socket.on('notification-refresh', (data) => {
          console.log('🔔 Notification refresh received on dashboard:', data);
          // You could dispatch actions to refresh notification counts here
        });

        return () => {
          socket.off("new-message");
          socket.off('notification-refresh');
          socket.disconnect();
        };
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userProfile = {
    name: user?.name || "Guest",
    email: user?.email || "N/A",
    phoneNumber: user?.phoneNumber || "N/A",
    role: user?.role || "user",
    avatar: getProfilePictureUrl(user?.profilePicture),
  };

  // Debug logging
  console.log('User Dashboard - User data:', user);
  console.log('User Dashboard - Profile picture path:', user?.profilePicture);
  console.log('User Dashboard - Constructed avatar URL:', userProfile.avatar);

  const modules = [
    // All modules removed as requested
  ];

  const navigateToShipmentDetail = (id) => {
    navigate(`/user/my-shipments/${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "accepted":
        return "text-blue-600 bg-blue-100";
      case "in-transit":
        return "text-indigo-600 bg-indigo-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading shipments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">        {/* Welcome Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-2xl shadow-lg mb-6">
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
                    <Package className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold">
                      Welcome back, {userProfile.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm font-medium">
                        ✓ Verified User
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium">
                        📦 {shipments.length + history.length} Total Shipments
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-blue-100 text-sm mb-4 max-w-2xl leading-relaxed">
                  Manage your shipments efficiently. Track deliveries, place orders, and monitor your logistics operations with our comprehensive platform.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/user/post-shipment')}
                    className="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-blue-50 transition-all duration-300 font-medium shadow-md flex items-center gap-2 text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post New Shipment
                  </button>
                  <button
                    onClick={() => navigate('/user/my-shipments')}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View All Shipments
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
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="User Avatar"
                      className="w-20 h-20 rounded-xl border-4 border-white/30 object-cover cursor-pointer shadow-lg hover:scale-105 transition-transform duration-300"
                      onClick={() => setShowProfilePicModal(true)}
                      onError={(e) => {
                        console.error("Profile picture failed to load:", e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback avatar */}
                  <div 
                    className={`w-20 h-20 rounded-xl border-4 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold shadow-lg ${userProfile.avatar ? 'hidden' : 'flex'}`}
                    style={{ display: userProfile.avatar ? 'none' : 'flex' }}
                    onClick={() => setShowProfilePicModal(true)}
                  >
                    {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
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

        {/* Stats Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Shipments Card */}
            <div className="group relative cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg hover:border-indigo-200 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              {/* Count Badge */}
              {(shipments.length + history.length) > 0 && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {shipments.length + history.length}
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    Total Shipments
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    All your posted shipments
                  </p>
                  <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors duration-300">
                    <span>View All</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Shipments Card */}
            <div className="group relative cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg hover:border-indigo-200 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              {/* Count Badge */}
              {shipments.length > 0 && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {shipments.length}
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Truck size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    Active Shipments
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Currently in progress
                  </p>
                  <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors duration-300">
                    <span>View All</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* History Card */}
            <div className="group relative cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg hover:border-indigo-200 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              {/* Count Badge */}
              {history.length > 0 && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {history.length}
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    Shipment History
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Delivered shipments
                  </p>
                  <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors duration-300">
                    <span>View All</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipments Section */}
        <section className="mb-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Package className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Shipments</h2>
                    <p className="text-indigo-100">Track and manage your logistics operations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <span className="text-white font-semibold">
                      {shipments.length + history.length} Total
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/user/post-shipment')}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                  >
                    <PlusCircle size={16} />
                    New Shipment
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              {shipments.length === 0 && history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📦</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Shipments Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't posted any shipments yet. Start by creating your first shipment request!
                  </p>
                  <button
                    onClick={() => navigate('/user/post-shipment')}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
                  >
                    Post Your First Shipment
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Active Shipments */}
                  {shipments.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Active Shipments ({shipments.length})
                        </h3>
                        <button
                          onClick={() => navigate('/user/my-shipments')}
                          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          View All
                          <ArrowRight size={16} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        {shipments.slice(0, 3).map((shipment, index) => (
                          <div
                            key={shipment._id}
                            className="group relative bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    📦
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                                    {shipment.shipmentTitle}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {shipment.pickupCity}, {shipment.pickupCountry} → {shipment.deliveryCity}, {shipment.deliveryCountry}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={12} />
                                      {new Date(shipment.preferredPickupDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar size={12} />
                                      {new Date(shipment.preferredDeliveryDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                                  shipment.status === 'open'
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    : shipment.status === 'accepted'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : shipment.status === 'delivered'
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                                </div>
                                <button
                                  onClick={() => navigateToShipmentDetail(shipment._id)}
                                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors flex items-center gap-2"
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipment History */}
                  {history.length > 0 && (
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                              <Package className="text-white" size={24} />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">Shipment History</h3>
                              <p className="text-indigo-100 text-lg">Your completed deliveries and shipments</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                              <span className="text-white font-semibold text-lg">
                                {history.length} shipments
                              </span>
                            </div>
                            <button
                              onClick={() => navigate('/user/my-shipments')}
                              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20 font-semibold"
                            >
                              <Eye size={16} />
                              View All
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-8">
                        <div className="space-y-6">
                          {history.slice(0, 3).map((shipment, index) => {
                            const getStatusIcon = (status) => {
                              switch (status) {
                                case 'completed':
                                  return <Package className="text-green-500" size={20} />;
                              case 'delivered':
                                return <Package className="text-blue-500" size={20} />;
                                default:
                                  return <Clock className="text-gray-500" size={20} />;
                              }
                            };

                            const getStatusColor = (status) => {
                              switch (status) {
                                case 'completed':
                                  return 'bg-green-100 text-green-800 border-green-200';
                              case 'delivered':
                                return 'bg-blue-100 text-blue-800 border-blue-200';
                                default:
                                  return 'bg-gray-100 text-gray-800 border-gray-200';
                              }
                            };

                            return (
                              <div
                                key={shipment._id}
                                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-6">
                                    <div className="relative">
                                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        📦
                                      </div>
                                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                                        {index + 1}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                                        {shipment.shipmentTitle}
                                      </h4>
                                      <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="text-gray-400" size={16} />
                                        <span className="text-gray-600 font-medium">
                                          {shipment.pickupCity}, {shipment.pickupCountry}
                                        </span>
                                        <ArrowRight className="text-gray-400" size={16} />
                                        <span className="text-gray-600 font-medium">
                                          {shipment.deliveryCity}, {shipment.deliveryCountry}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <span className="flex items-center gap-2">
                                          <Calendar className="text-indigo-500" size={14} />
                                          <span className="font-medium">Pickup:</span>
                                          {new Date(shipment.preferredPickupDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-2">
                                          <Calendar className="text-green-500" size={14} />
                                          <span className="font-medium">Delivery:</span>
                                          {new Date(shipment.preferredDeliveryDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-2">
                                          <Clock className="text-gray-400" size={14} />
                                          <span className="font-medium">Updated:</span>
                                          {new Date(shipment.updatedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border flex items-center gap-2 ${getStatusColor(shipment.status)}`}>
                                      {getStatusIcon(shipment.status)}
                                      {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                                    </div>
                                    <button
                                      onClick={() => navigateToShipmentDetail(shipment._id)}
                                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                      <Eye size={16} />
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {history.length > 3 && (
                          <div className="text-center pt-6">
                            <button
                              onClick={() => navigate('/user/my-shipments')}
                              className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold shadow-lg flex items-center gap-2 mx-auto"
                            >
                              <Package size={20} />
                              View All {history.length} Shipments
                              <ArrowRight size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      {/* Full Screen Image Viewer */}
      {showProfilePicModal && (
        <FullScreenImageViewer 
          isOpen={showProfilePicModal}
          onClose={() => setShowProfilePicModal(false)}
          imageUrl={userProfile.avatar}
          alt="Profile Picture"
        />
      )}
    </div>
  );
};

export default UserDashboardHome;
