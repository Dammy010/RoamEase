import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchShipmentDetailsById, markShipmentAsDeliveredAndRate } from '../../redux/slices/shipmentSlice';
import { Star } from 'lucide-react';

const DeliverShipmentPage = () => {
  const { shipmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentShipment, loading, error } = useSelector((state) => state.shipment);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
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
      await dispatch(markShipmentAsDeliveredAndRate({ id: shipmentId, rating, feedback })).unwrap();
      toast.success("Shipment marked as delivered and rated successfully!");
      navigate('/user/my-shipments'); // Redirect to My Shipments after submission
    } catch (err) {
      toast.error(err || "Failed to mark shipment as delivered.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700 animate-pulse">Loading shipment details...</p>
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
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Deliver Shipment & Rate</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-2">Shipment: {currentShipment.shipmentTitle}</h2>
          <p className="text-gray-700">From: {currentShipment.pickupCity} to {currentShipment.deliveryCity}</p>
          <p className="text-gray-600">Status: <span className="font-semibold capitalize">{currentShipment.status}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="rating" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Rate your experience:</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`cursor-pointer transition-colors duration-200 
                    ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="feedback" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Feedback (Optional):</label>
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
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
          >
            {loading ? 'Submitting...' : 'Mark as Delivered & Rate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliverShipmentPage;
