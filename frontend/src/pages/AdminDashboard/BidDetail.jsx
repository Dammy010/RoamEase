import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchAllBids } from "../../redux/slices/adminSlice";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  Wallet,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Truck,
  MessageSquare,
  Copy,
  Settings,
  DollarSign,
} from "lucide-react";

const AdminBidDetail = () => {
  const { id } = useParams(); // Get bid ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const { allBids, loading, error } = useSelector((state) => state.admin);
  const { user: adminInfo } = useSelector((state) => state.auth);

  // Find the specific bid
  const currentBid = allBids.find((bid) => bid._id === id);

  // Debug logging for carrier profile picture
  useEffect(() => {
    if (currentBid?.carrier) {
      console.log("🔍 Carrier Profile Picture Debug:", {
        profilePictureUrl: currentBid.carrier.profilePictureUrl,
        profilePicture: currentBid.carrier.profilePicture,
        hasProfilePictureUrl: !!currentBid.carrier.profilePictureUrl,
        hasProfilePicture: !!currentBid.carrier.profilePicture,
        carrierName: currentBid.carrier.name,
        allBidsLength: allBids.length,
        currentBidId: currentBid._id,
      });
    }
  }, [currentBid, allBids.length]);

  useEffect(() => {
    // Always fetch fresh bids data when component loads
    dispatch(fetchAllBids());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatBidAmount = (amount, currency) => {
    if (!amount || isNaN(amount)) return "₦0.00";

    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      INR: "₹",
      BRL: "R$",
      MXN: "$",
      ZAR: "R",
      AED: "د.إ",
      SGD: "S$",
    };

    const symbol = symbols[currency] || "₦";
    return `${symbol}${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wallet className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Loading Bid Details
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we fetch the bid information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-blue-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Error Loading Bid
          </h3>
          <p className="text-blue-600 dark:text-blue-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/admin/bids-list")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Back to Bids List
          </button>
        </div>
      </div>
    );
  }

  if (!currentBid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-blue-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Bid Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The bid you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/admin/bids-list")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Back to Bids List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-500 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/admin/bids-list")}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Wallet className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      Bid Details
                    </h1>
                    <p className="text-blue-100 text-base">
                      Monitor and manage bid information
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {formatBidAmount(currentBid.price, currentBid.currency)}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {currentBid.currency || "USD"}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
              <div className="bg-blue-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      {getStatusIcon(currentBid.status)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Bid Status
                      </h2>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 w-fit ${getStatusColor(
                          currentBid.status
                        )}`}
                      >
                        {getStatusIcon(currentBid.status)}
                        {currentBid.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm mb-1">Bid ID</div>
                    <div className="text-white font-mono text-lg">
                      {currentBid._id.slice(-12)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bid Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bid Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet size={20} />
                  Bid Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wallet className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Bid Amount
                        </h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatBidAmount(
                            currentBid.price,
                            currentBid.currency
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Currency: {currentBid.currency || "USD"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Created Date
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {new Date(currentBid.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(currentBid.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {currentBid.eta && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Estimated Delivery Time
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {currentBid.eta}
                      </p>
                    </div>
                  </div>
                )}

                {currentBid.message && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Message
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {currentBid.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipment Information */}
            {currentBid.shipment && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-blue-500 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package size={20} />
                    Shipment Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Shipment Title
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {currentBid.shipment.shipmentTitle ||
                              "Untitled Shipment"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Pickup Location
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {currentBid.shipment.pickupAddress ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Delivery Location
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {currentBid.shipment.deliveryAddress || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Carrier Information */}
          <div className="space-y-8">
            {/* Carrier Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User size={20} />
                  Carrier Information
                </h3>
              </div>
              <div className="p-6">
                {currentBid.carrier ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {currentBid.carrier.profilePictureUrl ? (
                          <img
                            src={currentBid.carrier.profilePictureUrl}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <User
                          className="text-blue-600"
                          size={20}
                          style={{
                            display: currentBid.carrier.profilePictureUrl
                              ? "none"
                              : "flex",
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {currentBid.carrier.name || "Unknown Carrier"}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentBid.carrier.email || "Email not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone size={14} />
                        <span>
                          {currentBid.carrier.phoneNumber ||
                            currentBid.carrier.phone ||
                            "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building2 size={14} />
                        <span>
                          {currentBid.carrier.companyName || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User size={14} />
                        <span>
                          Role: {currentBid.carrier.role || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Carrier information not available
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      The carrier data could not be loaded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings size={20} />
                  Actions
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {currentBid.status === "pending" && (
                  <>
                    <button
                      onClick={() => alert("Accept Bid: " + currentBid._id)}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Accept Bid
                    </button>
                    <button
                      onClick={() => alert("Reject Bid: " + currentBid._id)}
                      className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Reject Bid
                    </button>
                  </>
                )}
                <button
                  onClick={() =>
                    navigate(`/admin/shipments/${currentBid.shipment?._id}`)
                  }
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Package size={16} />
                  View Shipment
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentBid._id);
                    toast.success("Bid ID copied to clipboard");
                  }}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  Copy Bid ID
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBidDetail;
