import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Star, Package, MapPin, Calendar, Clock, Truck, User, Phone, Mail, 
  CheckCircle, AlertCircle, Award, Shield, Zap, RefreshCw, Search, 
  Filter, SortAsc, Eye, MoreVertical, ArrowLeft, Globe, FileText, 
  Image, TrendingUp, Building2, MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react';

import { rateCompletedShipment, fetchShipmentHistory, fetchUserShipments, fetchDeliveredShipments } from '../../redux/slices/shipmentSlice';

const RateShipment = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { history, shipments, deliveredShipments, loading, error } = useSelector((state) => state.shipment);
  
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch all shipment data when component mounts
  useEffect(() => {
    const fetchAllShipments = async () => {
      try {
        await Promise.all([
          dispatch(fetchShipmentHistory()),
          dispatch(fetchUserShipments()),
          dispatch(fetchDeliveredShipments())
        ]);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      }
    };
    
    fetchAllShipments();
  }, [dispatch]);
  
  // Combine all data sources and remove duplicates
  const allShipments = [...(history || []), ...(shipments || []), ...(deliveredShipments || [])];
  
  // Debug logging
  console.log('RateShipment Debug - Redux State:', {
    history: history?.length || 0,
    shipments: shipments?.length || 0,
    deliveredShipments: deliveredShipments?.length || 0,
    loading,
    error
  });
  
  // Remove duplicates based on _id
  const uniqueShipments = allShipments.filter((shipment, index, self) => 
    index === self.findIndex(s => s._id === shipment._id)
  );
  
  console.log('RateShipment Debug - Combined shipments:', uniqueShipments.length);
  
  // Filter shipments that can be rated (only completed shipments that haven't been rated)
  const rateableShipments = uniqueShipments.filter(shipment => {
    const isCompleted = shipment.status === 'completed';
    const notRated = !shipment.rating;
    
    // Debug logging for first shipment
    if (uniqueShipments.length > 0 && shipment === uniqueShipments[0]) {
      console.log('RateShipment Debug - First shipment fields:', Object.keys(shipment));
      console.log('RateShipment Debug - Status:', shipment.status);
      console.log('RateShipment Debug - Has rating:', !!shipment.rating);
      console.log('RateShipment Debug - Full shipment data:', shipment);
    }
    
    return isCompleted && notRated;
  });
  
  // Get shipments that are completed and already rated
  const alreadyRatedShipments = uniqueShipments.filter(shipment => {
    const isCompleted = shipment.status === 'completed';
    const hasRating = !!shipment.rating;
    return isCompleted && hasRating;
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
      const result = await dispatch(rateCompletedShipment({
        id: selectedShipment._id,
        rating,
        feedback
      })).unwrap();
      
      console.log('Rating submitted successfully:', result);
      
      setShowRatingForm(false);
      setSelectedShipment(null);
      setRating(0);
      setFeedback('');
      
      // Refresh all data sources
      await Promise.all([
        dispatch(fetchShipmentHistory()),
        dispatch(fetchUserShipments()),
        dispatch(fetchDeliveredShipments())
      ]);
      
      // Show additional success message
      toast.success(`Rating submitted! The logistics company has been notified of your ${rating}-star rating.`);
    } catch (error) {
      console.error('Rating submission error:', error);
      // Error is already handled in the Redux action
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(fetchShipmentHistory()),
        dispatch(fetchUserShipments()),
        dispatch(fetchDeliveredShipments())
      ]);
      toast.success('Data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh data');
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

  // Currency symbol helper function
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$',
      'MXN': '$',
      'ZAR': 'R',
      'NGN': '#'
    };
    return symbols[currency] || currency || '$';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Data</h3>
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
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                    <Star className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Rate Your Shipments</h1>
                    <p className="text-indigo-100">Rate and provide feedback for your completed shipments</p>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
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
                  <div className="text-2xl font-bold text-pink-600 mb-1">{uniqueShipments.length}</div>
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
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                      {searchTerm ? 'No Matching Shipments' : 'No Shipments to Rate'}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm 
                        ? 'Try adjusting your search criteria to find shipments to rate.'
                        : uniqueShipments.length === 0 
                          ? 'You don\'t have any shipments yet. Complete some deliveries to start rating.'
                          : 'You don\'t have any completed shipments that need rating yet.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Clear Search
                        </button>
                      )}
                      <button
                        onClick={handleRefresh}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
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
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg'
                        }`}
                        onClick={() => handleShipmentSelect(shipment)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                shipment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800 dark:text-gray-200'
                              }`}>
                                {shipment.status === 'completed' ? 'Ready to Rate' : shipment.status}
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
                                <span>Completed: {new Date(shipment.completedAt || shipment.updatedAt || shipment.createdAt).toLocaleDateString()}</span>
                              </div>
                              {shipment.deliveredByLogistics && (
                                <div className="flex items-center gap-2">
                                  <Truck className="text-green-500" size={16} />
                                  <span>Delivered by: {shipment.deliveredByLogistics?.companyName || shipment.deliveredByLogistics?.name || 'Logistics Company'}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Clock className="text-orange-500" size={16} />
                                <span>Status: {shipment.status}</span>
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
                                  {getCurrencySymbol(shipment.currency || shipment.bidCurrency || 'USD')}{shipment.budget || shipment.estimatedCost || shipment.bidAmount || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {getCurrencySymbol(shipment.currency || shipment.bidCurrency || 'USD')}{shipment.budget || shipment.estimatedCost || shipment.bidAmount || 'N/A'}
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-8">
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
                    <p className="text-sm text-gray-600 mb-2">
                      #{selectedShipment._id.slice(-6)} • {selectedShipment.pickupCity || selectedShipment.pickupLocation || 'N/A'} → {selectedShipment.deliveryCity || selectedShipment.deliveryLocation || 'N/A'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          <strong>Price:</strong> {getCurrencySymbol(selectedShipment.currency || selectedShipment.bidCurrency || 'USD')}{selectedShipment.budget || selectedShipment.estimatedCost || selectedShipment.bidAmount || 'N/A'}
                        </span>
                        {selectedShipment.deliveredByLogistics && (
                          <span className="text-gray-600">
                            <strong>Delivered by:</strong> {selectedShipment.deliveredByLogistics?.companyName || selectedShipment.deliveredByLogistics?.name || 'Logistics Company'}
                          </span>
                        )}
                      </div>
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
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback *
                      </label>
                      <textarea
                        id="feedback"
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
                    className="w-full mt-4 px-6 py-3 text-gray-600 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="text-indigo-500 text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Select a Shipment</h3>
                  <p className="text-gray-600">
                    Choose a completed shipment from the list to rate and provide feedback.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rating Guidelines */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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