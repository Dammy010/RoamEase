import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  fetchUserShipments,
  addShipmentRealtime,
  updateShipmentRealtime,
  deleteShipment,
  markShipmentAsDeliveredByUser,
} from "../../redux/slices/shipmentSlice";
import { getSocket } from "../../services/socket";
import { toast } from "react-toastify";
import {
  Package,
  MapPin,
  Calendar,
  Clock,
  Eye,
  Trash2,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Truck,
  Globe,
  User,
  Phone,
  Mail,
  FileText,
  Image,
  Star,
  TrendingUp,
  Plus,
  Filter,
  Search,
  SortAsc,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
// import BidListModal from '../../components/modals/BidListModal'; // Removed: No longer using modal

const MyShipments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    shipments = [],
    loading,
    error,
  } = useSelector((state) => state.shipment);
  const { user } = useSelector((state) => state.auth);

  // Popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  // Expanded shipments state
  const [expandedShipments, setExpandedShipments] = useState(new Set());

  const handleDeleteShipment = async (shipmentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this shipment? This action cannot be undone."
      )
    ) {
      const result = await dispatch(deleteShipment(shipmentId));
      if (deleteShipment.fulfilled.match(result)) {
        toast.success("Shipment deleted successfully");
      }
    }
  };

  const handleMarkAsDelivered = (shipmentId) => {
    setSelectedShipmentId(shipmentId);
    setShowConfirmPopup(true);
  };

  const confirmMarkAsDelivered = async () => {
    setShowConfirmPopup(false);
    const result = await dispatch(
      markShipmentAsDeliveredByUser(selectedShipmentId)
    );
    if (markShipmentAsDeliveredByUser.fulfilled.match(result)) {
      toast.success("Shipment marked as delivered successfully!");
    } else {
      const errorMessage =
        result.payload || "Failed to mark shipment as delivered";
      toast.error(errorMessage);
    }
    setSelectedShipmentId(null);
  };

  const toggleExpanded = (shipmentId) => {
    setExpandedShipments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(shipmentId)) {
        newSet.delete(shipmentId);
      } else {
        newSet.add(shipmentId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-orange-600" size={16} />;
      case "in_progress":
        return <Truck className="text-blue-600" size={16} />;
      case "delivered":
        return <CheckCircle className="text-green-600" size={16} />;
      case "cancelled":
        return <AlertCircle className="text-red-600" size={16} />;
      case "completed":
        return <CheckCircle className="text-green-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200";
    }
  };

  const cancelMarkAsReceived = () => {
    setShowConfirmPopup(false);
    setSelectedShipmentId(null);
  };

  useEffect(() => {
    dispatch(fetchUserShipments());
    const socket = getSocket();

    socket.on("new-shipment", (shipment) => {
      if (user && shipment.user._id === user._id) {
        dispatch(addShipmentRealtime(shipment));
        toast.info(`New shipment "${shipment.shipmentTitle}" created!`);
      }
    });

    socket.on("shipment-updated", (shipment) => {
      if (user && shipment.user._id === user._id) {
        dispatch(updateShipmentRealtime(shipment));
        toast.info(`Shipment "${shipment.shipmentTitle}" updated!`);
      }
    });

    // New: Listener for new bids on the user's shipments
    socket.on("new-bid-for-shipper", ({ shipmentId, conversationId, bid }) => {
      // Check if the bid is for one of the logged-in user's shipments
      const targetShipment = shipments.find((s) => s._id === shipmentId);
      if (user && targetShipment && targetShipment.user._id === user._id) {
        toast.info(
          `New bid placed by ${
            bid.carrier.companyName || bid.carrier.name
          } on your shipment "${
            targetShipment.shipmentTitle
          }"! Initiating chat.`
        );
        navigate(`/chat/${conversationId}`);
      }
    });

    return () => {
      socket.off("new-shipment");
      socket.off("shipment-updated");
      socket.off("new-bid-for-shipper"); // New: Clean up the new listener
    };
  }, [dispatch, user, navigate]);

  const handleRowClick = (shipmentId) => {
    navigate(`/user/my-shipments/${shipmentId}`); // Navigate to the detailed shipment view
  };

  // const closeBidListModal = () => { // Removed
  //   setShowBidListModal(false); // Removed
  //   setSelectedShipmentId(null); // Removed
  // }; // Removed

  return (
    <>
      <div className="min-h-screen p-3 sm:p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate("/user/dashboard")}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                  >
                    <ArrowRight
                      className="rotate-180 text-white sm:w-5 sm:h-5"
                      size={16}
                    />
                  </button>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border border-white/20">
                    <Package className="text-white sm:w-6 sm:h-6" size={20} />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white">
                      My Shipments
                    </h1>
                    <p className="text-indigo-100 text-sm sm:text-lg">
                      Manage and track all your shipments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 border border-white/20">
                    <span className="text-white font-semibold text-sm sm:text-lg">
                      {shipments?.length || 0} shipments
                    </span>
                  </div>
                  <button
                    onClick={() => dispatch(fetchUserShipments())}
                    className="px-3 py-2 sm:px-4 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                  >
                    <RefreshCw size={14} className="text-white sm:w-4 sm:h-4" />
                    <span className="text-white font-medium text-sm sm:text-base">
                      Refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            {/* Loading */}
            {loading && (
              <p className="text-gray-600 text-sm animate-pulse">
                Loading shipments...
              </p>
            )}

            {/* Error */}
            {!loading && error && (
              <p className="text-red-600 text-sm">⚠️ {error}</p>
            )}

            {shipments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="text-center py-8 sm:py-16">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Package className="text-indigo-500 text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                    No Shipments Yet
                  </h3>
                  <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Start by posting your first shipment to connect with
                    logistics providers worldwide!
                  </p>
                  <button
                    onClick={() => navigate("/user/post-shipment")}
                    className="px-4 py-2 sm:px-8 sm:py-4 bg-blue-500 text-white rounded-lg sm:rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    Post Your First Shipment
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {shipments.map((shipment, index) => (
                  <div
                    key={shipment._id}
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Compact Header View */}
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                        {/* Left Side - Shipment Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="relative">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm sm:text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                📦
                              </div>
                              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors duration-300 truncate">
                                  {shipment.shipmentTitle}
                                </h3>
                                <button
                                  onClick={() => toggleExpanded(shipment._id)}
                                  className="px-2 py-1 sm:px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs sm:text-sm self-start sm:self-center"
                                  title={
                                    expandedShipments.has(shipment._id)
                                      ? "Hide details"
                                      : "Show details"
                                  }
                                >
                                  {expandedShipments.has(shipment._id) ? (
                                    <>
                                      <ArrowLeft
                                        className="rotate-90 sm:w-3 sm:h-3"
                                        size={12}
                                      />
                                      <span className="hidden sm:inline">
                                        Hide
                                      </span>
                                      <span className="sm:hidden">-</span>
                                    </>
                                  ) : (
                                    <>
                                      <ArrowLeft
                                        className="-rotate-90 sm:w-3 sm:h-3"
                                        size={12}
                                      />
                                      <span className="hidden sm:inline">
                                        Details
                                      </span>
                                      <span className="sm:hidden">+</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin
                                  className="text-gray-400 sm:w-4 sm:h-4"
                                  size={14}
                                />
                                <span className="text-gray-600 font-medium text-sm sm:text-lg truncate">
                                  {shipment.pickupCity} →{" "}
                                  {shipment.deliveryCity}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Shipment Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar
                                  className="text-blue-600 sm:w-4 sm:h-4"
                                  size={14}
                                />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">
                                  Pickup Date
                                </div>
                                <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {shipment.preferredPickupDate
                                    ? new Date(
                                        shipment.preferredPickupDate
                                      ).toLocaleDateString()
                                    : "TBD"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Calendar
                                  className="text-green-600 sm:w-4 sm:h-4"
                                  size={14}
                                />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">
                                  Delivery Date
                                </div>
                                <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {shipment.preferredDeliveryDate
                                    ? new Date(
                                        shipment.preferredDeliveryDate
                                      ).toLocaleDateString()
                                    : "TBD"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-lg sm:rounded-xl">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package
                                  className="text-purple-600 sm:w-4 sm:h-4"
                                  size={14}
                                />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">
                                  Type
                                </div>
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {shipment.typeOfGoods || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                {getStatusIcon(shipment.status)}
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">
                                  Status
                                </div>
                                <div
                                  className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                                    shipment.status
                                  )}`}
                                >
                                  {shipment.status || "pending"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Awaiting Confirmation Badge */}
                          {shipment.status === "delivered" &&
                            shipment.awaitingUserConfirmation && (
                              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-xl border border-yellow-200">
                                <Clock className="text-yellow-600" size={16} />
                                <span className="text-sm font-semibold">
                                  Awaiting Your Confirmation
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Right Side - Actions */}
                        <div className="flex flex-col items-end gap-4">
                          <div
                            className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${getStatusColor(
                              shipment.status
                            )}`}
                          >
                            {getStatusIcon(shipment.status)}
                            <span className="font-semibold text-sm">
                              {shipment.status || "pending"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRowClick(shipment._id)}
                              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors flex items-center gap-2"
                              title="View Details"
                            >
                              <Eye size={16} />
                              View
                            </button>
                            {shipment.status === "delivered" &&
                              shipment.awaitingUserConfirmation && (
                                <button
                                  onClick={() =>
                                    handleMarkAsDelivered(shipment._id)
                                  }
                                  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center gap-2"
                                  title="Mark as Delivered"
                                >
                                  <CheckCircle size={16} />
                                  Delivered
                                </button>
                              )}
                            {(shipment.status === "open" ||
                              shipment.status === "pending") && (
                              <button
                                onClick={() =>
                                  handleDeleteShipment(shipment._id)
                                }
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2"
                                title="Delete Shipment"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Confirmation Popup */}
          {showConfirmPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-blue-500 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-white text-xl" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        Confirm Receipt
                      </h3>
                    </div>
                    <button
                      onClick={cancelMarkAsReceived}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📦</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Got it! Mark this shipment as delivered?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      This will confirm that you have received the shipment and
                      update its status.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={cancelMarkAsReceived}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmMarkAsDelivered}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={16} />
                        Confirm Delivery
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyShipments;
