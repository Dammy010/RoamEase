import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { markShipmentAsDeliveredByLogistics } from "../../redux/slices/shipmentSlice";
import { toast } from "react-toastify";
import api from "../../services/api";
import LogisticsLocationUpdater from "../../components/shipment/LogisticsLocationUpdater";
import DriverProfileManager from "../../components/shipment/DriverProfileManager";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Weight,
  Ruler,
  Shield,
  FileText,
  Image,
  RefreshCw,
  Wallet,
  MessageSquare,
  Globe,
  ArrowRight,
} from "lucide-react";

const ActiveShipments = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { formatCurrency, currency } = useCurrency();
  const { user } = useSelector((state) => state.auth);
  const [activeShipments, setActiveShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedShipments, setExpandedShipments] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [shipmentToDeliver, setShipmentToDeliver] = useState(null);

  // Helper function to get safe value
  const getSafeValue = (value, fallback = "Not specified") => {
    return value || fallback;
  };

  // Helper function to get display name safely
  const getDisplayName = (user) => {
    if (!user) return "Unknown User";
    if (user.companyName) return user.companyName;
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.email) return user.email;
    return "Unknown User";
  };

  const toggleExpanded = (shipmentId) => {
    const newExpanded = new Set(expandedShipments);
    if (newExpanded.has(shipmentId)) {
      newExpanded.delete(shipmentId);
    } else {
      newExpanded.add(shipmentId);
    }
    setExpandedShipments(newExpanded);
  };

  // Fetch active shipments (accepted bids) for this logistics company
  useEffect(() => {
    const fetchActiveShipments = async () => {
      setLoading(true);

      // Check localStorage for token
      const token = localStorage.getItem("token");
      // Check if user is logistics
      if (!user || user.role !== "logistics") {
        console.error("User is not a logistics company or not logged in");
        toast.error(
          "You must be logged in as a logistics company to view active shipments"
        );
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/shipments/my-active-shipments");
        setActiveShipments(response.data.shipments || []);
      } catch (error) {
        console.error("Error fetching active shipments:", error);
        console.error("Error response:", error.response);

        if (error.response?.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else if (error.response?.status === 404) {
          toast.info(
            "No active shipments found. You need to have accepted bids to see active shipments."
          );
        } else {
          toast.error("Failed to fetch active shipments. Please try again.");
        }
        setActiveShipments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveShipments();
  }, [user]);

  const handleMarkAsDeliveredClick = (shipment) => {
    setShipmentToDeliver(shipment);
    setShowDeliverModal(true);
  };

  const handleConfirmDeliver = async () => {
    if (!shipmentToDeliver) return;

    const shipmentId = shipmentToDeliver._id;
    setActionLoading((prev) => ({ ...prev, [shipmentId]: true }));
    setShowDeliverModal(false);

    try {
      const result = await dispatch(
        markShipmentAsDeliveredByLogistics(shipmentId)
      );

      if (markShipmentAsDeliveredByLogistics.fulfilled.match(result)) {
        toast.success("Shipment marked as delivered successfully!");

        // Update local state
        setActiveShipments((prev) =>
          prev.map((shipment) =>
            shipment._id === shipmentId
              ? { ...shipment, status: "delivered" }
              : shipment
          )
        );
      } else {
        const errorMessage =
          result.payload || "Failed to mark shipment as delivered";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Error marking shipment as delivered");
      console.error("Error:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [shipmentId]: false }));
      setShipmentToDeliver(null);
    }
  };

  const handleCancelDeliver = () => {
    setShowDeliverModal(false);
    setShipmentToDeliver(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-3 sm:p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-8 sm:py-16">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Loading Active Shipments
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Fetching your current deliveries...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Truck className="text-white sm:w-6 sm:h-6" size={20} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Active Shipments
                  </h1>
                  <p className="text-indigo-100 text-sm sm:text-base">
                    Manage your accepted bids and track deliveries
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 border border-white/20">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {activeShipments.length} active
                  </span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-2 sm:px-4 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20 text-xs sm:text-sm"
                >
                  <RefreshCw className="text-white sm:w-4 sm:h-4" size={14} />
                  <span className="text-white font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeShipments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-8 sm:py-16">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Truck className="text-indigo-500 text-3xl sm:text-4xl" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                No Active Shipments
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                You don't have any accepted bids or active shipments at the
                moment. Start by browsing available shipments and placing bids!
              </p>
              <button
                onClick={() =>
                  (window.location.href = "/logistics/available-shipments")
                }
                className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Available Shipments
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeShipments.map((shipment, index) => (
              <div
                key={shipment._id}
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Compact Header View */}
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left Side - Shipment Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            🚚
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors duration-300">
                              {shipment.shipmentTitle}
                            </h3>
                            <button
                              onClick={() => toggleExpanded(shipment._id)}
                              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                              title={
                                expandedShipments.has(shipment._id)
                                  ? "Hide details"
                                  : "Show details"
                              }
                            >
                              {expandedShipments.has(shipment._id) ? (
                                <>
                                  <ChevronUp size={14} />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={14} />
                                  Details
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="text-gray-400" size={16} />
                            <span className="text-gray-600 font-medium text-lg">
                              {shipment.pickupCity} → {shipment.deliveryCity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shipment Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Status
                            </div>
                            <div
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                shipment.status === "accepted"
                                  ? "bg-blue-100 text-blue-800"
                                  : shipment.status === "completed"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : shipment.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {shipment.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Wallet className="text-green-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Bid Price
                            </div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {formatCurrency(
                                shipment.acceptedBid?.price,
                                shipment.acceptedBid?.currency || "USD",
                                currency
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="text-purple-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              ETA
                            </div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {shipment.acceptedBid?.eta}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipper Info */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="text-gray-400" size={16} />
                            <span className="text-gray-600 font-medium">
                              Shipper:
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {shipment.user?.companyName ||
                                shipment.user?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="text-gray-400" size={16} />
                            <span className="text-gray-600">
                              {shipment.user?.country}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col items-end gap-4">
                      {shipment.status === "delivered" ? (
                        <div className="flex items-center gap-3 px-4 py-2 bg-green-100 text-green-800 rounded-xl border border-green-200">
                          <CheckCircle className="text-green-600" size={16} />
                          <span className="font-semibold text-sm">
                            Delivered
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkAsDeliveredClick(shipment);
                          }}
                          disabled={actionLoading[shipment._id]}
                          className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading[shipment._id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          {actionLoading[shipment._id]
                            ? "Processing..."
                            : "Mark as Delivered"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Detailed View */}
                {expandedShipments.has(shipment._id) && (
                  <div className="border-t border-gray-100 bg-blue-50">
                    <div className="p-8">
                      {/* Key Information Summary */}
                      <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-indigo-200">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                          <Truck className="text-indigo-600" size={20} />
                          Delivery Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">
                              Route
                            </div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {getSafeValue(shipment.pickupCity)} →{" "}
                              {getSafeValue(shipment.deliveryCity)}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">
                              Delivery Date
                            </div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {shipment.formattedDeliveryDate}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">
                              Transport Mode
                            </div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {shipment.modeOfTransport}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Goods & Transport */}
                        <div className="space-y-6">
                          {/* Goods Information */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <Package className="text-blue-600" size={20} />
                              Goods Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Package
                                    className="text-blue-600"
                                    size={16}
                                  />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Type
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.typeOfGoods)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Ruler className="text-green-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Quantity
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.quantitySummary)}
                                  </div>
                                </div>
                              </div>
                              {shipment.weight && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Weight
                                      className="text-purple-600"
                                      size={16}
                                    />
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 font-medium">
                                      Weight
                                    </div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                      {getSafeValue(shipment.weightSummary)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {shipment.dimensions && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Ruler
                                      className="text-orange-600"
                                      size={16}
                                    />
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 font-medium">
                                      Dimensions
                                    </div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                      {getSafeValue(shipment.dimensions)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                <div className="text-sm text-gray-500 font-medium mb-1">
                                  Description
                                </div>
                                <div className="text-sm text-gray-800 dark:text-gray-200">
                                  {getSafeValue(
                                    shipment.descriptionOfGoods,
                                    "No description provided"
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Transport Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <Truck className="text-indigo-600" size={20} />
                              Transport Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <Truck
                                    className="text-indigo-600"
                                    size={16}
                                  />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Mode
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.modeOfTransport)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Shield className="text-blue-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Insurance
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.insuranceRequired)}
                                  </div>
                                </div>
                              </div>
                              {shipment.handlingInstructions && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                  <div className="text-sm text-gray-500 font-medium mb-1">
                                    Handling Instructions
                                  </div>
                                  <div className="text-sm text-gray-800 dark:text-gray-200">
                                    {getSafeValue(
                                      shipment.handlingInstructions,
                                      "No special instructions"
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Location Details */}
                        <div className="space-y-6">
                          {/* Pickup Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <MapPin className="text-orange-600" size={20} />
                              Pickup Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <MapPin
                                    className="text-orange-600"
                                    size={16}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-500 font-medium">
                                    Address
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.pickupAddress)}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    City
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.pickupCity)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Country
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.pickupCountry)}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Contact Person
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.pickupContactPerson)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Phone
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.pickupPhoneNumber)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <MapPin className="text-green-600" size={20} />
                              Delivery Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <MapPin
                                    className="text-green-600"
                                    size={16}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-500 font-medium">
                                    Address
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.deliveryAddress)}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    City
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.deliveryCity)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Country
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.deliveryCountry)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Calendar
                                    className="text-blue-600"
                                    size={16}
                                  />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Delivery Date
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(
                                      shipment.formattedDeliveryDate
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Contact Person
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(
                                      shipment.deliveryContactPerson
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    Phone
                                  </div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {getSafeValue(shipment.deliveryPhoneNumber)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photos Section */}
                      {shipment.photos && shipment.photos.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                            <Image className="text-pink-600" size={20} />
                            Photos ({shipment.photos.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {shipment.photos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={`http://localhost:5000/${photo}`}
                                  alt={`Shipment photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105"
                                  onClick={() =>
                                    window.open(
                                      `http://localhost:5000/${photo}`,
                                      "_blank"
                                    )
                                  }
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                                  <Eye
                                    className="text-white opacity-0 group-hover:opacity-100"
                                    size={16}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      {shipment.documents && shipment.documents.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                            <FileText className="text-blue-600" size={20} />
                            Documents ({shipment.documents.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shipment.documents.map((document, index) => (
                              <div
                                key={index}
                                className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
                              >
                                <div className="flex-shrink-0 mr-4">
                                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    <FileText className="w-6 h-6 text-red-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {document.split("/").pop()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Document
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <button
                                    onClick={() =>
                                      window.open(
                                        `http://localhost:5000/${document}`,
                                        "_blank"
                                      )
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Eye size={14} />
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shipment ID and Actions */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            <span className="font-mono text-xs text-gray-400">
                              Shipment ID: {shipment._id.slice(-8)}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            {shipment.status === "delivered" ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-xl border border-green-200">
                                <CheckCircle size={16} />
                                <span className="font-semibold text-sm">
                                  Delivered
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleMarkAsDeliveredClick(shipment);
                                }}
                                disabled={actionLoading[shipment._id]}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[shipment._id] ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                                {actionLoading[shipment._id]
                                  ? "Processing..."
                                  : "Mark as Delivered"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Driver Profile Management Section */}
        <div className="mt-8">
          <DriverProfileManager />
        </div>

        {/* Location Tracking Section */}
        {activeShipments.length > 0 && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-green-500 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin size={20} />
                  Location Tracking
                </h2>
                <p className="text-green-100 mt-1">
                  Update your location for active shipments
                </p>
              </div>
              <div className="p-6">
                <LogisticsLocationUpdater
                  shipmentId={activeShipments[0]?._id}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Confirmation Modal */}
      {showDeliverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                  <AlertCircle
                    className="text-orange-600 dark:text-orange-400"
                    size={24}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Confirm Delivery
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to mark this shipment as delivered?
                </p>

                {shipmentToDeliver && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="text-blue-600" size={16} />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {getSafeValue(shipmentToDeliver.shipmentTitle)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-gray-400" size={14} />
                        <span>
                          {getSafeValue(shipmentToDeliver.pickupCity)} →{" "}
                          {getSafeValue(shipmentToDeliver.deliveryCity)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDeliver}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeliver}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveShipments;
