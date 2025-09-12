import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  Star, Package, MapPin, Calendar, Clock, User, Phone, 
  Eye, ChevronDown, ChevronUp, CheckCircle, AlertCircle, 
  Weight, Ruler, Shield, FileText, Image, RefreshCw,
  DollarSign, MessageSquare, Globe, ArrowRight, TrendingUp,
  Award, ThumbsUp, ThumbsDown, Filter, Search, Truck
} from 'lucide-react';

const Ratings = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRatings, setExpandedRatings] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

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

  const toggleExpanded = (ratingId) => {
    const newExpanded = new Set(expandedRatings);
    if (newExpanded.has(ratingId)) {
      newExpanded.delete(ratingId);
    } else {
      newExpanded.add(ratingId);
    }
    setExpandedRatings(newExpanded);
  };

  // Fetch ratings for this logistics company
  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      
      if (!user || user.role !== 'logistics') {
        toast.error('You must be logged in as a logistics company to view ratings');
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/shipments/my-ratings');
        console.log('Ratings API Response:', response.data);
        setRatings(response.data.ratings || []);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          toast.info('No ratings found yet.');
        } else {
          toast.error('Failed to fetch ratings. Please try again.');
        }
        setRatings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [user]);

  // Calculate rating statistics
  const ratingStats = {
    total: ratings.length,
    average: ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length).toFixed(1) : 0,
    distribution: {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length,
    }
  };

  // Filter and sort ratings
  const filteredAndSortedRatings = ratings
    .filter(rating => {
      const matchesSearch = !searchTerm || 
        (rating.shipmentTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rating.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rating.user?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
        (filterBy === '5-star' && rating.rating === 5) ||
        (filterBy === '4-star' && rating.rating === 4) ||
        (filterBy === '3-star' && rating.rating === 3) ||
        (filterBy === '2-star' && rating.rating === 2) ||
        (filterBy === '1-star' && rating.rating === 1);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.ratedAt || b.updatedAt) - new Date(a.ratedAt || a.updatedAt);
        case 'oldest':
          return new Date(a.ratedAt || a.updatedAt) - new Date(b.ratedAt || b.updatedAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating, size = 16) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={`${
          star <= rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return 'Not Rated';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Star className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Ratings</h3>
          <p className="text-gray-500">Please wait while we fetch your ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Star className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Customer Ratings</h1>
                <p className="text-blue-100 mt-1">View and manage your delivery ratings</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Rating Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Star className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ratingStats.average}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Award className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ratingStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <ThumbsUp className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">5-Star Ratings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ratingStats.distribution[5]}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ratingStats.total > 0 ? Math.round(((ratingStats.distribution[5] + ratingStats.distribution[4]) / ratingStats.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{star}</span>
                  <Star className="text-yellow-400 fill-current" size={16} />
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${ratingStats.total > 0 ? (ratingStats.distribution[star] / ratingStats.total) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                  {ratingStats.distribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by shipment title, customer name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Ratings</option>
                <option value="5-star">5 Stars</option>
                <option value="4-star">4 Stars</option>
                <option value="3-star">3 Stars</option>
                <option value="2-star">2 Stars</option>
                <option value="1-star">1 Star</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ratings List */}
        {filteredAndSortedRatings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Ratings Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? 'No ratings match your current filters.' 
                : 'Complete some deliveries to start receiving customer ratings.'}
            </p>
            {(searchTerm || filterBy !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedRatings.map((rating) => (
              <div
                key={rating._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Rating Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(rating.rating)}`}>
                          {rating.rating} Star - {getRatingText(rating.rating)}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {rating.shipmentTitle}
                      </h3>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{rating.user?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} />
                          <span>{rating.user?.companyName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{new Date(rating.ratedAt || rating.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleExpanded(rating._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {expandedRatings.has(rating._id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {/* Feedback Preview */}
                  {rating.feedback && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        "{rating.feedback.length > 150 ? `${rating.feedback.substring(0, 150)}...` : rating.feedback}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedRatings.has(rating._id) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipment Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Package size={20} />
                          Shipment Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <MapPin size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {rating.pickupCity}, {rating.pickupCountry} → {rating.deliveryCity}, {rating.deliveryCountry}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Weight size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {rating.weight} kg • {rating.typeOfGoods}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Truck size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {rating.modeOfTransport}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <DollarSign size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {getCurrencySymbol(rating.currency || 'USD')}{rating.budget || rating.estimatedCost || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Feedback */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <MessageSquare size={20} />
                          Customer Feedback
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating:</span>
                            <div className="flex items-center gap-1">
                              {renderStars(rating.rating, 20)}
                            </div>
                          </div>
                          {rating.feedback && (
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                              <p className="text-gray-700 dark:text-gray-300">{rating.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ratings;
