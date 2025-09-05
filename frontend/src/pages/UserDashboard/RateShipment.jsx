import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Star, Package, MapPin, Calendar, Clock, Truck, User, Phone, Mail, 
  CheckCircle, AlertCircle, Award, Shield, Zap, RefreshCw, Search, 
  Filter, SortAsc, Eye, MoreVertical, ArrowLeft, Globe, FileText, 
  Image, TrendingUp, Building2, MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react';

import { markShipmentAsDeliveredAndRate, fetchShipmentHistory, fetchUserShipments } from '../../redux/slices/shipmentSlice';

const RateShipment = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { history, shipments, loading, error } = useSelector((state) => state.shipment);
  
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch both shipment history and user shipments when component mounts
  useEffect(() => {
    try {
      dispatch(fetchShipmentHistory());
      dispatch(fetchUserShipments());
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  }, [dispatch]);
  
  // Combine both data sources
  const allShipments = [...(history || []), ...(shipments || [])];
  
  // Filter shipments that can be rated
  const rateableShipments = allShipments.filter(shipment => {
    const eligibleStatuses = ['accepted', 'completed', 'delivered', 'received'];
    const isEligible = eligibleStatuses.includes(shipment.status);
    const notRated = !shipment.rating;
    
    // Debug logging for first shipment
    if (allShipments.length > 0 && shipment === allShipments[0]) {
      console.log('RateShipment Debug - First shipment fields:', Object.keys(shipment));
      console.log('RateShipment Debug - Budget field:', shipment.budget);
      console.log('RateShipment Debug - EstimatedCost field:', shipment.estimatedCost);
      console.log('RateShipment Debug - Weight field:', shipment.weight);
      console.log('RateShipment Debug - Full shipment data:', shipment);
    }
    
    return isEligible && notRated;
  });
  
  // Get shipments that are eligible but already rated
  const alreadyRatedShipments = allShipments.filter(shipment => {
    const eligibleStatuses = ['accepted', 'completed', 'delivered', 'received'];
    const isEligible = eligibleStatuses.includes(shipment.status);
    const hasRating = !!shipment.rating;
    return isEligible && hasRating;
  });

  // Filter and sort rateable shipments
  const filteredAndSortedShipments = rateableShipments
    .filter(shipment => 
      !searchTerm || 
      (shipment.shipmentTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.pickupCity || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.deliveryCity || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        case 'oldest':
          return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
        case 'title':
          return (a.shipmentTitle || '').localeCompare(b.shipmentTitle || '');
        default:
          return 0;
      }
    });

  const handleShipmentSelect = (shipment) => {
    setSelectedShipment(shipment);
    setShowRatingForm(true);
    setRating(0);
    setFeedback('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    try {
      await dispatch(markShipmentAsDeliveredAndRate({
        id: selectedShipment._id,
        rating,
        feedback
      })).unwrap();
      
      toast.success('Rating submitted successfully!');
      setShowRatingForm(false);
      setSelectedShipment(null);
      setRating(0);
      setFeedback('');
      
      // Refresh the page or update the shipment list
      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Failed to submit rating');
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
            ? 'text-yellow-400 scale-110'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:scale-125' : ''}`}
      >
        <Star className="fill-current" size={32} />
      </button>
    ));
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor - Unacceptable service';
      case 2: return 'Fair - Below expectations';
      case 3: return 'Good - Met basic expectations';
      case 4: return 'Very Good - Exceeded expectations';
      case 5: return 'Excellent - Outstanding service';
      default: return 'Select a rating';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Star className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Shipments</h3>
          <p className="text-gray-500">Please wait while we fetch your shipment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Rate Your Shipments</h1>
                  <p className="text-indigo-100">Rate and provide feedback for your completed shipments</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">{rateableShipments.length}</div>
                  <div className="text-sm text-gray-600">Ready to Rate</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{alreadyRatedShipments.length}</div>
                  <div className="text-sm text-gray-600">Already Rated</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                  <div className="text-2xl font-bold text-pink-600 mb-1">{allShipments.length}</div>
                  <div className="text-sm text-gray-600">Total Shipments</div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by title, pickup, or delivery city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package size={20} />
                  Shipments Ready for Rating
                </h2>
              </div>
              
              <div className="p-6">
                {filteredAndSortedShipments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Star className="text-indigo-500 text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {searchTerm ? 'No Matching Shipments' : 'No Shipments to Rate'}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm 
                        ? 'Try adjusting your search criteria to find shipments to rate.'
                        : 'You don\'t have any completed shipments that need rating yet.'
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedShipments.map((shipment) => (
                      <div
                        key={shipment._id}
                        className={`group border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                          selectedShipment?._id === shipment._id
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }`}
                        onClick={() => handleShipmentSelect(shipment)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                shipment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                shipment.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                shipment.status === 'received' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {shipment.status}
                              </div>
                              <span className="text-sm text-gray-500">
                                #{shipment._id.slice(-6)}
                              </span>
                            </div>
                            
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {shipment.shipmentTitle || shipment.title || 'N/A'}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="text-blue-500" size={16} />
                                <span>
                                  {shipment.pickupCity || shipment.pickupLocation || 'N/A'} → 
                                  {shipment.deliveryCity || shipment.deliveryLocation || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="text-purple-500" size={16} />
                                <span>Completed: {new Date(shipment.updatedAt || shipment.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Package className="text-gray-400" size={16} />
                                <span>
                                  {shipment.weight ? `${shipment.weight}kg` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="text-gray-400" size={16} />
                                <span>
                                  ${shipment.budget || shipment.estimatedCost || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              ${shipment.budget || shipment.estimatedCost || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {shipment.weight ? `${shipment.weight}kg` : 'N/A'}
                            </div>
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
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Star size={20} />
                    Rate Shipment
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {selectedShipment.shipmentTitle || selectedShipment.title || 'N/A'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      #{selectedShipment._id.slice(-6)} • {selectedShipment.pickupCity || selectedShipment.pickupLocation || 'N/A'} → {selectedShipment.deliveryCity || selectedShipment.deliveryLocation || 'N/A'}
                    </p>
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
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback *
                      </label>
                      <textarea
                        id="feedback"
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Share your experience with this shipment delivery..."
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={rating === 0 || !feedback.trim()}
                      className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Submit Rating
                    </button>
                  </form>

                  <button
                    onClick={() => {
                      setShowRatingForm(false);
                      setSelectedShipment(null);
                    }}
                    className="w-full mt-4 px-6 py-3 text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="text-indigo-500 text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Shipment</h3>
                  <p className="text-gray-600">
                    Choose a completed shipment from the list to rate and provide feedback.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rating Guidelines */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
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
                        <Star key={star} className={`h-4 w-4 ${star <= 1 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>Poor - Unacceptable service</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= 3 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span>Good - Met basic expectations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
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
    </div>
  );
};

export default RateShipment;