import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchShipmentDetailsById,
  markShipmentAsDeliveredByUser,
  rateCompletedShipment,
} from "../../redux/slices/shipmentSlice";
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
  Send,
} from "lucide-react";

const DeliverShipmentPage = () => {
  const { shipmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentShipment, loading, error } = useSelector(
    (state) => state.shipment
  );
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (shipmentId) {
      dispatch(fetchShipmentDetailsById(shipmentId));
    }
  }, [dispatch, shipmentId]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Please provide a rating.");
      return;
    }

    try {
      // First mark as delivered
      await dispatch(markShipmentAsDeliveredByUser(shipmentId)).unwrap();

      // Then rate the shipment
      await dispatch(
        rateCompletedShipment({ id: shipmentId, rating, feedback })
      ).unwrap();

      toast.success("Shipment marked as delivered and rated successfully!");
      navigate("/user/my-shipments"); // Redirect to My Shipments after submission
    } catch (err) {
      toast.error(err || "Failed to mark shipment as delivered.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700 animate-pulse">
          Loading shipment details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!currentShipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Shipment not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto">
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
                    Deliver Shipment & Rate
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Confirm delivery and rate your experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-bold text-blue-800 mb-2">
              Shipment: {currentShipment.shipmentTitle}
            </h2>
            <p className="text-gray-700">
              From: {currentShipment.pickupCity} to{" "}
              {currentShipment.deliveryCity}
            </p>
            <p className="text-gray-600">
              Status:{" "}
              <span className="font-semibold capitalize">
                {currentShipment.status}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="rating"
                className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3"
              >
                Rate your experience:
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    className={`cursor-pointer transition-colors duration-200 
                      ${
                        (hoverRating || rating) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    onClick={() => handleRatingChange(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="feedback"
                className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3"
              >
                Feedback (Optional):
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows="5"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 dark:text-gray-200"
                placeholder="Share your thoughts about the delivery..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-300 
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                }`}
            >
              {loading ? "Submitting..." : "Mark as Delivered & Rate"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliverShipmentPage;
