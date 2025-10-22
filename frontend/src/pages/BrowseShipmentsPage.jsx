import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCurrency } from "../contexts/CurrencyContext";
import { fetchPublicOpenShipments } from "../redux/slices/shipmentSlice";
import {
  Package,
  Search,
  Filter,
  SortAsc,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Weight,
  Ruler,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  Wallet,
  MessageSquare,
  User,
  Phone,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Globe,
  ExternalLink,
  LogIn,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BrowseShipmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { availableShipments, loading, error } = useSelector(
    (state) => state.shipment
  );
  const { user } = useSelector((state) => state.auth);

  const [expandedShipments, setExpandedShipments] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    dispatch(fetchPublicOpenShipments());
  }, [dispatch]);

  const toggleShipmentDetails = (shipmentId) => {
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

  const filteredShipments = availableShipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipmentTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.pickupCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.deliveryCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Only show open shipments
    const isOpen = shipment.status === "open";

    return matchesSearch && isOpen;
  });

  const sortedShipments = [...filteredShipments].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "price-high":
        return (b.budget || 0) - (a.budget || 0);
      case "price-low":
        return (a.budget || 0) - (b.budget || 0);
      case "pickup":
        return a.pickupCity?.localeCompare(b.pickupCity) || 0;
      case "delivery":
        return a.deliveryCity?.localeCompare(b.deliveryCity) || 0;
      default:
        return 0;
    }
  });

  const getLogisticsDisplayName = (user) => {
    if (!user) return "Unknown User";
    return user.companyName || user.name || user.email || "Unknown User";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <CheckCircle className="w-4 h-4" />;
      case "accepted":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Loading shipments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Open Shipments
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Browse shipments that are currently open for bidding
              </p>
            </div>

            {/* Action Buttons */}
            {user && (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Only Open Shipments Available
            </div>
          </div>
        </div>

        {/* Search and Sort Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search open shipments by title, pickup, delivery, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Sort and Refresh */}
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="pickup">Pickup City A-Z</option>
                <option value="delivery">Delivery City A-Z</option>
              </select>

              <button
                onClick={() => dispatch(fetchPublicOpenShipments())}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Open Shipments
                </p>
                <p className="text-3xl font-bold">
                  {availableShipments.filter((s) => s.status === "open").length}
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Available for bidding
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-blue-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Active Routes
                </p>
                <p className="text-3xl font-bold">
                  {
                    new Set(
                      availableShipments
                        .filter((s) => s.status === "open")
                        .map((s) => `${s.pickupCity} → ${s.deliveryCity}`)
                    ).size
                  }
                </p>
                <p className="text-purple-100 text-sm mt-1">Unique routes</p>
              </div>
              <MapPin className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {sortedShipments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm
                  ? "No matching open shipments found"
                  : "No open shipments available"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search criteria to find open shipments"
                  : "No shipments are currently available for bidding. Check back later for new opportunities."}
              </p>
              <div className="space-y-4">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Search
                  </button>
                )}
                {!user && (
                  <div className="space-x-4">
                    <Link
                      to="/signup"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Sign Up to Post Shipments
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Become a Logistics Provider
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            sortedShipments.map((shipment) => (
              <div
                key={shipment._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Shipment Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                          {shipment.shipmentTitle}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 bg-green-100 text-green-800 w-fit">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">
                            Open for Bidding
                          </span>
                          <span className="sm:hidden">Open</span>
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="font-medium truncate">
                            {shipment.pickupCity}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium truncate">
                            {shipment.deliveryCity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {formatDate(shipment.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {shipment.budget && (
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-600">
                            Budget
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-green-600">
                            {formatCurrency(shipment.budget)}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => toggleShipmentDetails(shipment._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        {expandedShipments.has(shipment._id) ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    {shipment.weightSummary && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Weight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">
                          {shipment.weightSummary}
                        </span>
                      </div>
                    )}
                    {shipment.dimensions && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Ruler className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">
                          {shipment.dimensions}
                        </span>
                      </div>
                    )}
                    {shipment.pickupDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">
                          Pickup:{" "}
                          {new Date(shipment.pickupDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {shipment.deliveryDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">
                          Delivery:{" "}
                          {new Date(shipment.deliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shipper Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {getLogisticsDisplayName(shipment.user)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Shipper
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {!user ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Link
                            to="/login"
                            className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                          >
                            <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">
                              Login to Bid
                            </span>
                            <span className="sm:hidden">Login</span>
                          </Link>
                          <Link
                            to="/signup"
                            className="px-4 py-2 sm:px-6 sm:py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
                          >
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">
                              Join as Provider
                            </span>
                            <span className="sm:hidden">Join</span>
                          </Link>
                        </div>
                      ) : user.role === "logistics" ? (
                        <Link
                          to="/logistics-dashboard/available-shipments"
                          className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">BID NOW</span>
                          <span className="sm:hidden">BID</span>
                        </Link>
                      ) : user.role === "user" ? (
                        <Link
                          to="/dashboard"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedShipments.has(shipment._id) && (
                  <div className="border-t border-gray-100 bg-gray-50 dark:bg-gray-700 p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Description
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {shipment.description || "No description provided"}
                        </p>
                      </div>

                      {/* Special Instructions */}
                      {shipment.specialInstructions && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Special Instructions
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {shipment.specialInstructions}
                          </p>
                        </div>
                      )}

                      {/* Contact Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Contact Information
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {getLogisticsDisplayName(shipment.user)}
                            </span>
                          </div>
                          {shipment.user?.email && (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {shipment.user.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Additional Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipment ID:</span>
                            <span className="font-mono text-sm text-gray-700">
                              {shipment._id.slice(-8)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-700">
                              {formatDate(shipment.createdAt)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                shipment.status
                              )}`}
                            >
                              {shipment.status.charAt(0).toUpperCase() +
                                shipment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseShipmentsPage;
