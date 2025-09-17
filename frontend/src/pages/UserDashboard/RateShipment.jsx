import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../contexts/CurrencyContext";
import { toast } from "react-toastify";
import {
  Star,
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
  ArrowRight,
  Globe,
  FileText,
  Image,
  TrendingUp,
  Building2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import {
  rateCompletedShipment,
  fetchShipmentHistory,
  fetchUserShipments,
  fetchDeliveredShipments,
} from "../../redux/slices/shipmentSlice";

const RateShipment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getCurrencySymbol } = useCurrency();
  const { user } = useSelector((state) => state.auth);
  const { history, shipments, deliveredShipments, loading, error } =
    useSelector((state) => state.shipment);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Fetch completed shipments that can be rated
  useEffect(() => {
    const fetchRateableShipments = async () => {
      try {
        // Fetch shipment history which includes completed shipments
        await dispatch(fetchShipmentHistory());
        // Also fetch user shipments to get any completed ones
        await dispatch(fetchUserShipments());
      } catch (error) {
        console.error("Error fetching rateable shipments:", error);
        toast.error("Failed to load shipments for rating");
      }
    };

    fetchRateableShipments();
  }, [dispatch]);

  // Combine all data sources and remove duplicates
  const allShipments = [...(history || []), ...(shipments || [])];

  // Remove duplicates based on _id
  const uniqueShipments = allShipments.filter(
    (shipment, index, self) =>
      index === self.findIndex((s) => s._id === shipment._id)
  );

  // Filter shipments that can be rated (only completed shipments that haven't been rated)
  const rateableShipments = uniqueShipments.filter((shipment) => {
    const isCompleted = shipment.status === "completed";
    const notRated = !shipment.rating;

    if (uniqueShipments.length > 0 && shipment === uniqueShipments[0]) {
    }

    return isCompleted && notRated;
  });

  // Get shipments that are completed and already rated
  const alreadyRatedShipments = uniqueShipments.filter((shipment) => {
    const isCompleted = shipment.status === "completed";
    const hasRating = !!shipment.rating;
    return isCompleted && hasRating;
  });

  // Filter and sort rateable shipments
  const filteredAndSortedShipments = rateableShipments
    .filter(
      (shipment) =>
        !searchTerm ||
        (shipment.shipmentTitle || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (shipment.pickupCity || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (shipment.deliveryCity || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
          );
        case "oldest":
          return (
            new Date(a.updatedAt || a.createdAt) -
            new Date(b.updatedAt || b.createdAt)
          );
        case "title":
          return (a.shipmentTitle || "").localeCompare(b.shipmentTitle || "");
        default:
          return 0;
      }
    });

  const handleShipmentSelect = (shipment) => {
    setSelectedShipment(shipment);
    setShowRatingForm(true);
    setRating(0);
    setFeedback("");
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingRating(true);

    try {
      const result = await dispatch(
        rateCompletedShipment({
          id: selectedShipment._id,
          rating,
          feedback,
        })
      ).unwrap();

      setShowRatingForm(false);
      setSelectedShipment(null);
      setRating(0);
      setFeedback("");

      // Refresh data sources
      await Promise.all([
        dispatch(fetchShipmentHistory()),
        dispatch(fetchUserShipments()),
      ]);

      // Show additional success message
      toast.success(
        `Rating submitted! The logistics company has been notified of your ${rating}-star rating.`
      );
    } catch (error) {
      console.error("Rating submission error:", error);
      // Show additional error message if needed
      if (error && typeof error === "string" && !error.includes("Rating")) {
        toast.error("Failed to submit rating. Please try again.");
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(fetchShipmentHistory()),
        dispatch(fetchUserShipments()),
      ]);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  const renderStars = (currentRating, interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type={interactive ? "button" : "button"}
        disabled={!interactive}
        onClick={interactive ? () => setRating(star) : undefined}
        onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
        onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        className={`text-3xl transition-all duration-300 ${
          star <= (hoveredRating || currentRating)
            ? "text-yellow-400 scale-110 drop-shadow-lg"
            : "text-gray-300"
        } ${
          interactive
            ? "cursor-pointer hover:scale-125 hover:drop-shadow-md"
            : ""
        }`}
        title={`${star} star${star > 1 ? "s" : ""} - ${getRatingText(star)}`}
      >
        <Star className="fill-current" size={32} />
      </button>
    ));
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Poor - Unacceptable service, major issues";
      case 2:
        return "Fair - Below expectations, some problems";
      case 3:
        return "Good - Met basic expectations, satisfactory";
      case 4:
        return "Very Good - Exceeded expectations, pleased";
      case 5:
        return "Excellent - Outstanding service, highly recommended";
      default:
        return "Click a star to rate this delivery";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Star className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Shipments
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch your shipment history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <ArrowRight className="rotate-180 text-white" size={20} />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Star className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Rate Your Shipments
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Share your experience and help others choose the best
                    logistics providers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold text-lg">
                    {rateableShipments?.length || 0} rateable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {rateableShipments.length}
                </div>
                <div className="text-sm text-gray-600">Ready to Rate</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {alreadyRatedShipments.length}
                </div>
                <div className="text-sm text-gray-600">Already Rated</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-pink-600 mb-1">
                  {uniqueShipments.length}
                </div>
                <div className="text-sm text-gray-600">Total Shipments</div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by title, pickup, or delivery city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">By Title</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Shipment List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-500 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package size={20} />
                Shipments Ready for Rating
              </h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="text-indigo-500 text-4xl animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    Loading Shipments...
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Please wait while we fetch your completed shipments.
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="text-red-500 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    Error Loading Shipments
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {error || "Failed to load shipments. Please try again."}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                </div>
              ) : filteredAndSortedShipments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="text-indigo-500 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {searchTerm
                      ? "No Matching Shipments"
                      : "No Shipments to Rate"}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchTerm
                      ? "Try adjusting your search criteria to find shipments to rate."
                      : uniqueShipments.length === 0
                      ? "You don't have any shipments yet. Complete some deliveries to start rating."
                      : "You don't have any completed shipments that need rating yet."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Clear Search
                      </button>
                    )}
                    <button
                      onClick={handleRefresh}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Refresh Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedShipments.map((shipment) => (
                    <div
                      key={shipment._id}
                      className={`group border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                        selectedShipment?._id === shipment._id
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg"
                      }`}
                      onClick={() => handleShipmentSelect(shipment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                shipment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {shipment.status === "completed"
                                ? "Ready to Rate"
                                : shipment.status}
                            </div>
                            <span className="text-sm text-gray-500">
                              #{shipment._id.slice(-6)}
                            </span>
                          </div>

                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {shipment.shipmentTitle || shipment.title || "N/A"}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="text-blue-500" size={16} />
                              <span>
                                {shipment.pickupCity ||
                                  shipment.pickupLocation ||
                                  "N/A"}
                                , {shipment.pickupCountry || "N/A"} →
                                {shipment.deliveryCity ||
                                  shipment.deliveryLocation ||
                                  "N/A"}
                                , {shipment.deliveryCountry || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="text-purple-500" size={16} />
                              <span>
                                Completed:{" "}
                                {new Date(
                                  shipment.completedAt ||
                                    shipment.updatedAt ||
                                    shipment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {shipment.deliveredByLogistics && (
                              <div className="flex items-center gap-2">
                                <Truck className="text-green-500" size={16} />
                                <span>
                                  Delivered by:{" "}
                                  {shipment.deliveredByLogistics?.companyName ||
                                    shipment.deliveredByLogistics?.name ||
                                    "Logistics Company"}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Package className="text-indigo-500" size={16} />
                              <span>Type: {shipment.typeOfGoods || "N/A"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="text-gray-400" size={16} />
                              <span>
                                {shipment.weight
                                  ? `${shipment.weight}kg`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="text-gray-400" size={16} />
                              <span>
                                {getCurrencySymbol(
                                  shipment.acceptedBid?.currency ||
                                    shipment.currency ||
                                    "USD"
                                )}
                                {shipment.acceptedBid?.price ||
                                  shipment.budget ||
                                  shipment.estimatedCost ||
                                  "N/A"}
                              </span>
                            </div>
                            {shipment.acceptedBid?.eta && (
                              <div className="flex items-center gap-2">
                                <Clock className="text-gray-400" size={16} />
                                <span>ETA: {shipment.acceptedBid.eta}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {getCurrencySymbol(
                              shipment.acceptedBid?.currency ||
                                shipment.currency ||
                                "USD"
                            )}
                            {shipment.acceptedBid?.price ||
                              shipment.budget ||
                              shipment.estimatedCost ||
                              "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {shipment.weight ? `${shipment.weight}kg` : "N/A"}
                          </div>
                          {shipment.acceptedBid?.eta && (
                            <div className="text-xs text-gray-400 mt-1">
                              ETA: {shipment.acceptedBid.eta}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Rating Form */}
        <div className="lg:col-span-1">
          {showRatingForm && selectedShipment ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-8">
              <div className="bg-blue-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star size={20} />
                  Rate Shipment
                </h3>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedShipment.shipmentTitle ||
                      selectedShipment.title ||
                      "N/A"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    #{selectedShipment._id.slice(-6)} •{" "}
                    {selectedShipment.pickupCity ||
                      selectedShipment.pickupLocation ||
                      "N/A"}
                    , {selectedShipment.pickupCountry || "N/A"} →{" "}
                    {selectedShipment.deliveryCity ||
                      selectedShipment.deliveryLocation ||
                      "N/A"}
                    , {selectedShipment.deliveryCountry || "N/A"}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        <strong>Price:</strong>{" "}
                        {getCurrencySymbol(
                          selectedShipment.acceptedBid?.currency ||
                            selectedShipment.currency ||
                            "USD"
                        )}
                        {selectedShipment.acceptedBid?.price ||
                          selectedShipment.budget ||
                          selectedShipment.estimatedCost ||
                          "N/A"}
                      </span>
                      <span className="text-gray-600">
                        <strong>Weight:</strong>{" "}
                        {selectedShipment.weight
                          ? `${selectedShipment.weight}kg`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        <strong>Type:</strong>{" "}
                        {selectedShipment.typeOfGoods || "N/A"}
                      </span>
                      {selectedShipment.acceptedBid?.eta && (
                        <span className="text-gray-600">
                          <strong>ETA:</strong>{" "}
                          {selectedShipment.acceptedBid.eta}
                        </span>
                      )}
                    </div>
                    {selectedShipment.deliveredByLogistics && (
                      <div className="flex items-center gap-2">
                        <Truck className="text-green-500" size={16} />
                        <span className="text-gray-600">
                          <strong>Delivered by:</strong>{" "}
                          {selectedShipment.deliveredByLogistics?.companyName ||
                            selectedShipment.deliveredByLogistics?.name ||
                            "Logistics Company"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleRatingSubmit} className="space-y-6">
                  {/* Rating Stars */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Overall Rating *
                    </label>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {renderStars(rating, true)}
                    </div>
                    <p className="text-center text-sm text-gray-600 font-medium">
                      {getRatingText(rating)}
                    </p>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label
                      htmlFor="feedback"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Feedback (Optional)
                    </label>
                    <textarea
                      id="feedback"
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Share your experience with this shipment delivery (optional)..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={rating === 0 || isSubmittingRating}
                    className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingRating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Submit Rating
                      </>
                    )}
                  </button>
                </form>

                <button
                  onClick={() => {
                    setShowRatingForm(false);
                    setSelectedShipment(null);
                  }}
                  className="w-full mt-4 px-6 py-3 text-gray-600 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="text-indigo-500 text-4xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Select a Shipment
                </h3>
                <p className="text-gray-600">
                  Choose a completed shipment from the list to rate and provide
                  feedback.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Guidelines */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-blue-500 p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award size={20} />
            Rating Guidelines
          </h3>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ThumbsUp className="text-green-500" size={20} />
                What to Consider
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1" size={16} />
                  <span>On-time delivery and pickup</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1" size={16} />
                  <span>Condition of goods upon arrival</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1" size={16} />
                  <span>Communication and updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1" size={16} />
                  <span>Professional service quality</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                Rating Scale
              </h4>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= 1
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span>Poor - Unacceptable service</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= 3
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span>Good - Met basic expectations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span>Excellent - Outstanding service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateShipment;
