import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  fetchUserShipments,
  fetchShipmentHistory,
} from "../../redux/slices/shipmentSlice";
import { toast } from "react-toastify";
import {
  Package,
  MapPin,
  Calendar,
  Clock,
  Eye,
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
  CheckCircle,
} from "lucide-react";

const AllShipments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    shipments = [],
    history = [],
    loading,
    error,
  } = useSelector((state) => state.shipment);
  const { user } = useSelector((state) => state.auth);

  // Combined shipments (active + history)
  const allShipments = [...shipments, ...history].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Expanded shipments state
  const [expandedShipments, setExpandedShipments] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      case "open":
        return <Package className="text-blue-600" size={16} />;
      case "accepted":
        return <Truck className="text-indigo-600" size={16} />;
      case "delivered":
        return <CheckCircle className="text-green-600" size={16} />;
      case "completed":
        return <CheckCircle className="text-green-600" size={16} />;
      case "cancelled":
        return <AlertCircle className="text-red-600" size={16} />;
      case "returned":
        return <ArrowLeft className="text-orange-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Open";
      case "accepted":
        return "Accepted";
      case "delivered":
        return "Delivered";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "returned":
        return "Returned";
      default:
        return status;
    }
  };

  useEffect(() => {
    dispatch(fetchUserShipments());
    dispatch(fetchShipmentHistory());
  }, [dispatch]);

  const handleRowClick = (shipmentId) => {
    navigate(`/user/my-shipments/${shipmentId}`);
  };

  const handleRefresh = () => {
    dispatch(fetchUserShipments());
    dispatch(fetchShipmentHistory());
    toast.success("Shipments refreshed!");
  };

  // Filter shipments based on search term and status
  const filteredShipments = allShipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipmentTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.pickupCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.deliveryCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.descriptionOfGoods
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "accepted", label: "Accepted" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "returned", label: "Returned" },
  ];

  return (
    <div className="min-h-screen p-3 sm:p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                All Shipments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your shipments ({allShipments.length} total)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => navigate("/user/post-shipment")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                New Shipment
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No shipments match your filters"
                : "No shipments found"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => navigate("/user/post-shipment")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Shipment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShipments.map((shipment, index) => (
              <div
                key={shipment._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRowClick(shipment._id)}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          📦
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                            {shipment.shipmentTitle}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              shipment.status
                            )}`}
                          >
                            {getStatusIcon(shipment.status)}
                            <span className="ml-1">
                              {getStatusLabel(shipment.status)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>
                              {shipment.pickupCity}, {shipment.pickupCountry} →{" "}
                              {shipment.deliveryCity},{" "}
                              {shipment.deliveryCountry}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              Created:{" "}
                              {new Date(
                                shipment.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {shipment.preferredPickupDate && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>
                                Pickup:{" "}
                                {new Date(
                                  shipment.preferredPickupDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(shipment._id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(shipment._id);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedShipments.has(shipment._id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shipment.descriptionOfGoods ||
                              "No description provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                            Details
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {shipment.weight && (
                              <p>Weight: {shipment.weight} kg</p>
                            )}
                            {shipment.quantity && (
                              <p>Quantity: {shipment.quantity}</p>
                            )}
                            {shipment.estimatedValue && (
                              <p>Value: ${shipment.estimatedValue}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllShipments;
