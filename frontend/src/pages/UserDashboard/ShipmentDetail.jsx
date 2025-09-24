import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  fetchShipmentById,
  updateShipmentStatus,
  deleteShipment,
  markShipmentAsDeliveredByUser,
} from "../../redux/slices/shipmentSlice";
import { toast } from "react-toastify";
import ShipmentTracking from "../../components/shipment/ShipmentTracking";
import { getStaticAssetUrl } from "../../utils/imageUtils";
import {
  ArrowRight,
  Package,
  MapPin,
  Calendar,
  Clock,
  Truck,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Award,
  Shield,
  Zap,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  Eye,
  MoreVertical,
  Globe,
  FileText,
  Image,
  TrendingUp,
  Building2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Edit,
  Download,
  ExternalLink,
  Star,
  Wallet,
  Weight,
  Ruler,
  ShieldCheck,
  HandHeart,
  Navigation,
  PhoneCall,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  AlertTriangle,
  Info,
} from "lucide-react";

const ShipmentDetail = () => {
  const { id } = useParams(); // Get shipment ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const {
    currentShipment,
    loading: shipmentLoading,
    error: shipmentError,
  } = useSelector((state) => state.shipment);
  // Removed bidsForShipment from useSelector as bids are handled by MyShipments/BidListModal
  const { user: userInfo } = useSelector((state) => state.auth);

  // Popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchShipmentById(id));
    }
    return () => {}; // Empty cleanup as no socket listeners here anymore
  }, [dispatch, id]);

  // Removed useEffect for fetching bids as bids are handled by MyShipments/BidListModal

  const handleAcceptBid = async (bidId) => {
    // Removed bid acceptance logic from here as bids are handled by MyShipments/BidListModal
    toast.info('Bid acceptance is handled in the "My Shipments" list.');
  };

  const handleUpdateShipmentStatus = async (newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to update shipment status to "${newStatus}"?`
      )
    ) {
      const result = await dispatch(
        updateShipmentStatus({ id, status: newStatus })
      );
      if (updateShipmentStatus.fulfilled.match(result)) {
        toast.success(`Shipment status updated to ${newStatus}`);
      }
    }
  };

  const handleDeleteShipment = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this shipment? This action cannot be undone."
      )
    ) {
      const result = await dispatch(deleteShipment(id));
      if (deleteShipment.fulfilled.match(result)) {
        toast.success("Shipment deleted successfully");
        navigate("/user/my-shipments");
      }
    }
  };

  const handleMarkAsDelivered = () => {
    setShowConfirmPopup(true);
  };

  const confirmMarkAsDelivered = async () => {
    setShowConfirmPopup(false);
    const result = await dispatch(markShipmentAsDeliveredByUser(id));
    if (markShipmentAsDeliveredByUser.fulfilled.match(result)) {
      toast.success("Shipment marked as delivered successfully!");
      // Refresh the shipment data
      dispatch(fetchShipmentById(id));
    } else {
      const errorMessage =
        result.payload || "Failed to mark shipment as delivered";
      toast.error(errorMessage);
    }
  };

  const cancelMarkAsDelivered = () => {
    setShowConfirmPopup(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "open":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "accepted":
        return <Award className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "open":
        return <Package className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (shipmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Loading Shipment Details
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we fetch the shipment information...
          </p>
        </div>
      </div>
    );
  }

  if (shipmentError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Error Loading Shipment
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{shipmentError}</p>
          <button
            onClick={() => navigate("/user/my-shipments")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Back to My Shipments
          </button>
        </div>
      </div>
    );
  }

  if (!currentShipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Shipment Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The shipment you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/user/my-shipments")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Back to My Shipments
          </button>
        </div>
      </div>
    );
  }

  const isShipper =
    userInfo &&
    currentShipment.user &&
    currentShipment.user._id === userInfo._id;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/user/my-shipments")}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <ArrowRight className="rotate-180 text-white" size={20} />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Shipment Details
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    View and manage your shipment information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 ${getStatusColor(
                  currentShipment.status
                )}`}
              >
                {getStatusIcon(currentShipment.status)}
                <span className="font-semibold capitalize">
                  {currentShipment.status}
                </span>
              </div>
              {currentShipment.status === "delivered" &&
                currentShipment.awaitingUserConfirmation && (
                  <div className="px-4 py-2 bg-yellow-100 text-yellow-800 border-2 border-yellow-200 rounded-full flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      Awaiting Confirmation
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Goods Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package size={20} />
                  Goods Information
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Description
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.descriptionOfGoods || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Truck className="text-purple-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Type of Goods
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.typeOfGoods || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Weight className="text-green-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Weight
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.weight
                            ? `${currentShipment.weight} kg`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Package className="text-orange-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Quantity
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.quantity || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Ruler className="text-indigo-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Dimensions
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.length &&
                          currentShipment.width &&
                          currentShipment.height
                            ? `${currentShipment.length} × ${currentShipment.width} × ${currentShipment.height} cm`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <Navigation className="text-cyan-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Mode of Transport
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.modeOfTransport || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="text-red-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Insurance Required
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.insuranceRequired || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                        <HandHeart className="text-pink-600" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Handling Instructions
                        </h3>
                        <p className="text-gray-600">
                          {currentShipment.handlingInstructions || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Location & Contact Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin size={20} />
                  Location & Contact Details
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pickup Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="text-green-600" size={16} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pickup Details
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="text-gray-400 mt-1" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.pickupAddress},{" "}
                            {currentShipment.pickupCity},{" "}
                            {currentShipment.pickupCountry}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CalendarIcon
                          className="text-gray-400 mt-1"
                          size={16}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            Preferred Pickup Date
                          </p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.preferredPickupDate
                              ? new Date(
                                  currentShipment.preferredPickupDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="text-gray-400 mt-1" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">
                            Contact Person
                          </p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.pickupContactPerson || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="text-gray-400 mt-1" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">
                            Phone Number
                          </p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.pickupPhoneNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="text-blue-600" size={16} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Delivery Details
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="text-gray-400 mt-1" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.deliveryAddress},{" "}
                            {currentShipment.deliveryCity},{" "}
                            {currentShipment.deliveryCountry}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CalendarIcon
                          className="text-gray-400 mt-1"
                          size={16}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            Preferred Delivery Date
                          </p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.preferredDeliveryDate
                              ? new Date(
                                  currentShipment.preferredDeliveryDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="text-gray-400 mt-1" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">
                            Contact Person
                          </p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.deliveryContactPerson || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="text-gray-400 mt-1" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">
                            Phone Number
                          </p>
                          <p className="text-gray-600 text-sm">
                            {currentShipment.deliveryPhoneNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            {console.log("🔍 Photos data:", currentShipment.photos)}
            {currentShipment.photos && currentShipment.photos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-blue-500 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Image size={20} />
                    Photos ({currentShipment.photos.length})
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentShipment.photos.map((photo, index) => (
                      <div key={index} className="group relative">
                        <div className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <img
                            src={getStaticAssetUrl(photo)}
                            alt={`Shipment photo ${index + 1}`}
                            onError={(e) => {
                              console.error("❌ Image failed to load:", getStaticAssetUrl(photo));
                              console.error("❌ Original photo path:", photo);
                            }}
                            onLoad={() => {
                              console.log("✅ Image loaded successfully:", getStaticAssetUrl(photo));
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onClick={() =>
                              window.open(
                                getStaticAssetUrl(photo),
                                "_blank"
                              )
                            }
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ExternalLink className="text-white" size={24} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {currentShipment.documents &&
              currentShipment.documents.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-blue-500 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText size={20} />
                      Documents ({currentShipment.documents.length})
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentShipment.documents.map((document, index) => (
                        <div
                          key={index}
                          className="group flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors duration-300">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {document.split("/").pop()}
                            </p>
                            <p className="text-sm text-gray-500">Document</p>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() =>
                                window.open(
                                  `https://roamease-3wg1.onrender.com/${document}`,
                                  "_blank"
                                )
                              }
                              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                              <ExternalLink size={14} />
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap size={18} />
                  Quick Actions
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Manage Bids Button */}
                <button
                  onClick={() => navigate("/user/manage-bids")}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Wallet size={18} />
                  Manage Bids
                </button>

                {/* Track Shipment Button */}
                {currentShipment?.status === "accepted" && (
                  <button
                    onClick={() => setShowTrackingModal(true)}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Navigation size={18} />
                    Track Shipment
                  </button>
                )}

                {/* Mark as Received Button */}
                {(currentShipment?.status === "delivered" || isShipper) && (
                  <button
                    onClick={handleMarkAsDelivered}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Mark as Delivered
                  </button>
                )}

                {/* Mark as Completed Button */}
                {isShipper && currentShipment.status === "accepted" && (
                  <button
                    onClick={() => handleUpdateShipmentStatus("completed")}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Award size={18} />
                    Mark as Completed
                  </button>
                )}

                {/* Delete Button */}
                {isShipper &&
                  (currentShipment.status === "open" ||
                    currentShipment.status === "pending") && (
                    <button
                      onClick={handleDeleteShipment}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete Shipment
                    </button>
                  )}
              </div>
            </div>

            {/* Shipment Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info size={18} />
                  Shipment Info
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Status</span>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(
                      currentShipment.status
                    )}`}
                  >
                    {getStatusIcon(currentShipment.status)}
                    {currentShipment.status}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Created</span>
                  <span className="text-gray-900 text-sm">
                    {new Date(currentShipment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">
                    Last Updated
                  </span>
                  <span className="text-gray-900 text-sm">
                    {new Date(currentShipment.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Shipment ID</span>
                  <span className="text-gray-900 text-sm font-mono">
                    #{currentShipment._id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                  onClick={cancelMarkAsDelivered}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <AlertCircle size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="text-green-600 text-3xl" />
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
                  onClick={cancelMarkAsDelivered}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkAsDelivered}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

      {/* Tracking Modal */}
      {showTrackingModal && (
        <ShipmentTracking
          shipmentId={id}
          onClose={() => setShowTrackingModal(false)}
        />
      )}
    </div>
  );
};

export default ShipmentDetail;
