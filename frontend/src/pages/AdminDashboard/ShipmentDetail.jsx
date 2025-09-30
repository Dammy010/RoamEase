import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchShipmentById } from "../../redux/slices/shipmentSlice";
import { toast } from "react-toastify";
import ShipmentTracking from "../../components/shipment/ShipmentTracking";
import { getStaticAssetUrl } from "../../utils/imageUtils";
import {
  ArrowLeft,
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
  FileText,
  Image,
  Wallet,
  Weight,
  Ruler,
  Navigation,
  UserCircle,
  Building,
} from "lucide-react";

const AdminShipmentDetail = () => {
  const { id } = useParams(); // Get shipment ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const {
    currentShipment,
    loading: shipmentLoading,
    error: shipmentError,
  } = useSelector((state) => state.shipment);
  const { user: adminInfo } = useSelector((state) => state.auth);

  // Popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchShipmentById(id));
    }
  }, [dispatch, id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <Package className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <Award className="w-4 h-4" />;
      case "delivered":
        return <Truck className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-blue-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Error Loading Shipment
          </h3>
          <p className="text-blue-600 dark:text-blue-400 mb-4">
            {shipmentError}
          </p>
          <button
            onClick={() => navigate("/admin/shipments")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Back to Shipments List
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
            onClick={() => navigate("/admin/shipments")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Back to Shipments List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/shipments")}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <ArrowLeft className="text-white" size={20} />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Admin - Shipment Details
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Monitor and manage shipment information
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-indigo-100">Shipment ID</div>
                <div className="text-lg font-mono text-white">
                  {currentShipment._id.slice(-8)}
                </div>
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
                  {getStatusIcon(currentShipment.status)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {currentShipment.shipmentTitle || "Untitled Shipment"}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(
                        currentShipment.status
                      )}`}
                    >
                      {getStatusIcon(currentShipment.status)}
                      {currentShipment.status?.toUpperCase()}
                    </span>
                    <span className="text-indigo-100 text-sm">
                      Created:{" "}
                      {new Date(currentShipment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTrackingModal(true)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 flex items-center gap-2"
                >
                  <Navigation size={16} />
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipment Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Route Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin size={20} />
                  Route Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {currentShipment.pickupAddress || "Not specified"}
                        </p>
                        {currentShipment.pickupCity && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {currentShipment.pickupCity}
                          </p>
                        )}
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
                          Delivery Location
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {currentShipment.deliveryAddress || "Not specified"}
                        </p>
                        {currentShipment.deliveryCity && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {currentShipment.deliveryCity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package size={20} />
                  Shipment Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Weight className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Weight
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {currentShipment.weight || "Not specified"} kg
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Ruler className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Dimensions
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {currentShipment.length &&
                          currentShipment.width &&
                          currentShipment.height
                            ? `${currentShipment.length} × ${currentShipment.width} × ${currentShipment.height} cm`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-purple-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Preferred Dates
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {currentShipment.preferredPickupDate &&
                          currentShipment.preferredDeliveryDate
                            ? `${new Date(
                                currentShipment.preferredPickupDate
                              ).toLocaleDateString()} - ${new Date(
                                currentShipment.preferredDeliveryDate
                              ).toLocaleDateString()}`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {currentShipment.descriptionOfGoods && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {currentShipment.descriptionOfGoods}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Photos and Documents */}
            {(currentShipment.photos?.length > 0 ||
              currentShipment.documents?.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-blue-500 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Image size={20} />
                    Photos & Documents
                  </h3>
                </div>
                <div className="p-6">
                  {currentShipment.photos?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Photos
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentShipment.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={getStaticAssetUrl(photo)}
                              alt={`Shipment photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.target.src = "/default-image.svg";
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <button
                                onClick={() =>
                                  window.open(
                                    getStaticAssetUrl(photo),
                                    "_blank"
                                  )
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 px-3 py-1 rounded-lg text-sm font-medium"
                              >
                                View Full Size
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentShipment.documents?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Documents
                      </h4>
                      <div className="space-y-2">
                        {currentShipment.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="text-blue-500" size={20} />
                              <span className="text-gray-900 dark:text-gray-100">
                                Document {index + 1}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                window.open(getStaticAssetUrl(doc), "_blank")
                              }
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - User Information & Actions */}
          <div className="space-y-8">
            {/* User Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-blue-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCircle size={20} />
                  Shipment Owner
                </h3>
              </div>
              <div className="p-6">
                {currentShipment.user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {currentShipment.user.profilePictureUrl ? (
                          <img
                            src={currentShipment.user.profilePictureUrl}
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
                            display: currentShipment.user.profilePictureUrl
                              ? "none"
                              : "flex",
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {currentShipment.user.name || "Unknown User"}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentShipment.user.email || "Email not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone size={14} />
                        <span>
                          {currentShipment.user.phoneNumber ||
                            currentShipment.user.phone ||
                            "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building size={14} />
                        <span>
                          {currentShipment.user.companyName || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User size={14} />
                        <span>
                          Role: {currentShipment.user.role || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCircle className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      User information not available
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      The shipment owner data could not be loaded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Accepted Logistics Company */}
            {currentShipment.acceptedBid &&
              currentShipment.acceptedBid.carrier && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-blue-500 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Truck size={20} />
                      Accepted Logistics Company
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {currentShipment.acceptedBid.carrier
                            .profilePictureUrl ? (
                            <img
                              src={
                                currentShipment.acceptedBid.carrier
                                  .profilePictureUrl
                              }
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <Truck
                            className="text-blue-600"
                            size={20}
                            style={{
                              display: currentShipment.acceptedBid.carrier
                                .profilePictureUrl
                                ? "none"
                                : "flex",
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {currentShipment.acceptedBid.carrier.name ||
                              "Unknown Logistics"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentShipment.acceptedBid.carrier.email ||
                              "Email not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Phone size={14} />
                          <span>
                            {currentShipment.acceptedBid.carrier.phoneNumber ||
                              currentShipment.acceptedBid.carrier.phone ||
                              "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Building size={14} />
                          <span>
                            {currentShipment.acceptedBid.carrier.companyName ||
                              "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Wallet size={14} />
                          <span>
                            Bid: ₦
                            {currentShipment.acceptedBid.price?.toLocaleString() ||
                              "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar size={14} />
                          <span>
                            ETA:{" "}
                            {currentShipment.acceptedBid.eta || "Not specified"}
                          </span>
                        </div>
                      </div>
                      {currentShipment.acceptedBid.message && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Message:</strong>{" "}
                            {currentShipment.acceptedBid.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Tracking Modal */}
        {showTrackingModal && (
          <ShipmentTracking
            shipmentId={id}
            onClose={() => setShowTrackingModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminShipmentDetail;
