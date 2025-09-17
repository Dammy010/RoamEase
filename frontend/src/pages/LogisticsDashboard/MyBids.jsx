import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { fetchMyBids, cancelBid, updateBid } from "../../redux/slices/bidSlice";
import { getSocket } from "../../services/socket";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  Wallet,
  Clock,
  MessageSquare,
  MapPin,
  Calendar,
  Package,
  User,
  Phone,
  Eye,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Image,
  Globe,
  Truck,
  Star,
  Ruler,
} from "lucide-react";

const MyBids = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { formatCurrency, getCurrencySymbol, parseCurrency, currency } =
    useCurrency();
  const { myBids, loading, error } = useSelector((state) => state.bid);
  const { user } = useSelector((state) => state.auth);
  const [expandedBids, setExpandedBids] = useState(new Set());
  const [showEditBidModal, setShowEditBidModal] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [editBidPrice, setEditBidPrice] = useState("");
  const [editBidCurrency, setEditBidCurrency] = useState("USD");
  const [editBidEta, setEditBidEta] = useState("");
  const [editBidMessage, setEditBidMessage] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const toggleExpanded = (bidId) => {
    const newExpanded = new Set(expandedBids);
    if (newExpanded.has(bidId)) {
      newExpanded.delete(bidId);
    } else {
      newExpanded.add(bidId);
    }
    setExpandedBids(newExpanded);
  };

  const handleCancelBid = async (bidId, shipmentTitle) => {
    if (
      window.confirm(
        `Are you sure you want to cancel your bid for "${
          shipmentTitle || "this shipment"
        }"? This action cannot be undone.`
      )
    ) {
      setActionLoading((prev) => ({ ...prev, [bidId]: true }));
      try {
        const result = await dispatch(cancelBid(bidId));
        if (cancelBid.fulfilled.match(result)) {
          toast.success("Bid cancelled successfully");
          dispatch(fetchMyBids());
        } else if (cancelBid.rejected.match(result)) {
          toast.error(result.payload || "Failed to cancel bid");
        }
      } catch (error) {
        console.error("Error cancelling bid:", error);
        toast.error("Failed to cancel bid");
      } finally {
        setActionLoading((prev) => ({ ...prev, [bidId]: false }));
      }
    }
  };

  const handleEditBidClick = (bid) => {
    setEditingBid(bid);
    setEditBidPrice(bid.price.toString());
    setEditBidCurrency(bid.currency || "USD");
    setEditBidEta(bid.eta);
    setEditBidMessage(bid.message || "");
    setShowEditBidModal(true);
  };

  const handleEditBidSubmit = async (e) => {
    e.preventDefault();
    if (!editBidPrice || !editBidEta || !editingBid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setActionLoading((prev) => ({ ...prev, editBid: true }));
    try {
      const parsedPrice = parseFloat(
        editBidPrice.replace(/[^\d.,]/g, "").replace(",", ".")
      );
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast.error("Please enter a valid bid amount");
        return;
      }

      const bidData = {
        price: parsedPrice,
        currency: editBidCurrency,
        eta: editBidEta.trim(),
        message: editBidMessage.trim(),
      };

      const result = await dispatch(
        updateBid({ bidId: editingBid._id, bidData })
      );
      if (updateBid.fulfilled.match(result)) {
        setShowEditBidModal(false);
        setEditingBid(null);
        setEditBidPrice("");
        setEditBidEta("");
        setEditBidMessage("");
        setEditBidCurrency("USD");
        dispatch(fetchMyBids());
        toast.success("Bid updated successfully!");
      } else if (updateBid.rejected.match(result)) {
        toast.error(
          result.payload || "Failed to update bid. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating bid:", error);
      toast.error("Failed to update bid");
    } finally {
      setActionLoading((prev) => ({ ...prev, editBid: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="text-green-500" size={20} />;
      case "rejected":
        return <XCircle className="text-red-500" size={20} />;
      case "pending":
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper function to format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
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

  // Helper function to get safe value
  const getSafeValue = (value, fallback = "Not specified") => {
    return value || fallback;
  };

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on("bid-updated", (updatedBid) => {
        if (
          updatedBid.logisticsUser === user?._id ||
          updatedBid.carrier === user?._id
        ) {
          dispatch(fetchMyBids());
        }
      });

      socket.on("shipment-updated", (updatedShipment) => {
        // Refresh bids if any of our bids are for this shipment
        dispatch(fetchMyBids());
      });

      return () => {
        socket.off("bid-updated");
        socket.off("shipment-updated");
      };
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Loading Your Bids
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fetching your bid information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                Error Loading Bids
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={() => dispatch(fetchMyBids())}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className="inline-block mr-2" size={20} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/30 transition-all duration-300"
                >
                  <ArrowLeft className="text-white" size={24} />
                </button>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <Wallet
                    className="text-indigo-600 dark:text-indigo-200"
                    size={32}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Bids</h1>
                  <p className="text-indigo-100 text-lg">
                    Track and manage your shipment bids
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold text-lg">
                    {myBids.length} bids
                  </span>
                </div>
                <button
                  onClick={() => dispatch(fetchMyBids())}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                >
                  <RefreshCw size={16} className="text-white" />
                  <span className="text-white font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bids List */}
        {myBids.length > 0 ? (
          <div className="space-y-6">
            {myBids.map((bid, index) => {
              const isExpanded = expandedBids.has(bid._id);

              // Skip bids without shipment data
              if (!bid.shipment) {
                console.warn("Bid without shipment data:", bid);
                return null;
              }

              return (
                <div
                  key={bid._id}
                  className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Compact Header View */}
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Left Side - Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package className="text-white" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {getSafeValue(
                                bid.shipment?.shipmentTitle,
                                "Untitled Shipment"
                              )}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span className="line-clamp-1">
                                  {getSafeValue(bid.shipment?.pickupAddress)}{" "}
                                  {getSafeValue(bid.shipment?.pickupCity)}{" "}
                                  {getSafeValue(bid.shipment?.pickupCountry)} →{" "}
                                  {getSafeValue(bid.shipment?.deliveryAddress)}{" "}
                                  {getSafeValue(bid.shipment?.deliveryCity)}{" "}
                                  {getSafeValue(bid.shipment?.deliveryCountry)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>
                                  {formatDate(
                                    bid.shipment?.preferredPickupDate
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Key Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Wallet className="text-green-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">
                                Your Bid
                              </div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {formatCurrency(
                                  bid.price || 0,
                                  bid.currency || "USD",
                                  currency
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Clock className="text-blue-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">
                                ETA
                              </div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {getSafeValue(bid.eta)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Ruler className="text-purple-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">
                                Quantity
                              </div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {getSafeValue(bid.shipment?.quantity)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Truck className="text-orange-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">
                                Mode
                              </div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {getSafeValue(bid.shipment?.modeOfTransport)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Actions & Status */}
                      <div className="flex flex-col items-end gap-4">
                        {/* Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              bid.status
                            )}`}
                          >
                            {getStatusIcon(bid.status)}
                            <span className="ml-1 capitalize">
                              {bid.status}
                            </span>
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExpanded(bid._id)}
                            title={
                              isExpanded
                                ? "Hide detailed bid information"
                                : "View complete bid details"
                            }
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 ${
                              isExpanded
                                ? "bg-gray-600 text-white hover:bg-gray-700"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            <Eye size={16} />
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>

                          {bid.status === "pending" && (
                            <div className="flex flex-col items-end">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleEditBidClick(bid)}
                                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                  <Wallet size={16} />
                                  Edit Bid
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelBid(
                                      bid._id,
                                      bid.shipment?.shipmentTitle
                                    )
                                  }
                                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                  <XCircle size={16} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {bid.status === "accepted" && (
                            <button
                              onClick={() => navigate("/logistics/chat")}
                              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                              <MessageSquare size={16} />
                              View Chat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details View */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Shipment Details */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Package className="text-indigo-600" size={20} />
                              Shipment Details
                            </h4>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Type of Goods
                                  </label>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    {getSafeValue(bid.shipment?.typeOfGoods)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Weight
                                  </label>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    {getSafeValue(bid.shipment?.weight)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Pickup Date
                                  </label>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    {formatDate(
                                      bid.shipment?.preferredPickupDate
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Delivery Date
                                  </label>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    {formatDate(
                                      bid.shipment?.preferredDeliveryDate
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Description
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                  {getSafeValue(
                                    bid.shipment?.descriptionOfGoods,
                                    "No description provided"
                                  )}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Pickup Location
                                  </label>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    {getSafeValue(bid.shipment?.pickupAddress)}{" "}
                                    {getSafeValue(bid.shipment?.pickupCity)}{" "}
                                    {getSafeValue(bid.shipment?.pickupCountry)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Delivery Location
                                  </label>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    {getSafeValue(
                                      bid.shipment?.deliveryAddress
                                    )}{" "}
                                    {getSafeValue(bid.shipment?.deliveryCity)}{" "}
                                    {getSafeValue(
                                      bid.shipment?.deliveryCountry
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Shipper Information */}
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <User className="text-blue-600" size={20} />
                              Shipper Information
                            </h4>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="text-blue-600" size={24} />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-white">
                                    {getDisplayName(bid.shipment?.user)}
                                  </h5>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {getSafeValue(bid.shipment?.user?.email)}
                                  </p>
                                  {(bid.shipment?.user?.phone ||
                                    bid.shipment?.user?.contactPhone) && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                      📞{" "}
                                      {bid.shipment.user.phone ||
                                        bid.shipment.user.contactPhone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => navigate("/logistics/chat")}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                  <MessageSquare size={16} />
                                  Chat
                                </button>
                                {(bid.shipment?.user?.phone ||
                                  bid.shipment?.user?.contactPhone) && (
                                  <a
                                    href={`tel:${
                                      bid.shipment.user.phone ||
                                      bid.shipment.user.contactPhone
                                    }`}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                  >
                                    <Phone size={16} />
                                    Call
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Your Bid Details */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Wallet className="text-green-600" size={20} />
                              Your Bid Details
                            </h4>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Bid Amount
                                  </label>
                                  <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(
                                      bid.price || 0,
                                      bid.currency || "USD",
                                      currency
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Currency
                                  </label>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {getSafeValue(bid.currency, "USD")}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Estimated Delivery
                                  </label>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {getSafeValue(bid.eta)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Status
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(bid.status)}
                                    <span className="font-semibold capitalize">
                                      {bid.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Your Message
                                </label>
                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                  {getSafeValue(
                                    bid.message,
                                    "No message provided"
                                  )}
                                </p>
                              </div>

                              <div className="flex gap-3">
                                {bid.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleEditBidClick(bid)}
                                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                    >
                                      <Wallet size={16} />
                                      Edit Bid
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCancelBid(
                                          bid._id,
                                          bid.shipment?.shipmentTitle
                                        )
                                      }
                                      disabled={actionLoading[bid._id]}
                                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {actionLoading[bid._id] ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <XCircle size={16} />
                                      )}
                                      {actionLoading[bid._id]
                                        ? "Cancelling..."
                                        : "Cancel Bid"}
                                    </button>
                                  </>
                                )}
                                {bid.status === "accepted" && (
                                  <button
                                    onClick={() => navigate("/logistics/chat")}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                  >
                                    <MessageSquare size={16} />
                                    View Chat
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                Error Loading Bids
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {error ||
                  "There was an error loading your bids. Please try again."}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => dispatch(fetchMyBids())}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
                <button
                  onClick={() => navigate("/logistics/available-shipments")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Browse Shipments
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                No Bids Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                You haven't placed any bids yet. Start by browsing available
                shipments and place your first bid!
              </p>
              <button
                onClick={() => navigate("/logistics/available-shipments")}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Shipments
              </button>
            </div>
          </div>
        )}

        {/* Edit Bid Modal */}
        {showEditBidModal && editingBid && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Bid
                  </h3>
                  <button
                    onClick={() => setShowEditBidModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <form onSubmit={handleEditBidSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bid Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {getCurrencySymbol(editBidCurrency)}
                        </span>
                        <input
                          type="text"
                          value={editBidPrice}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(
                              /[^\d.,]/g,
                              ""
                            );
                            setEditBidPrice(cleanValue);
                          }}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter bid amount"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={editBidCurrency}
                        onChange={(e) => setEditBidCurrency(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="USD">USD - United States Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">
                          GBP - British Pound Sterling
                        </option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="BRL">BRL - Brazilian Real</option>
                        <option value="MXN">MXN - Mexican Peso</option>
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="NGN">NGN - Nigerian Naira</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estimated Delivery Time
                      </label>
                      <input
                        type="text"
                        value={editBidEta}
                        onChange={(e) => setEditBidEta(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 3-5 business days"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={editBidMessage}
                      onChange={(e) => setEditBidMessage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      rows={4}
                      placeholder="Add a message to the shipper..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditBidModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading.editBid}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {actionLoading.editBid ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Bid"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
