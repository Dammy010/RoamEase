import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { fetchAvailableShipments, addShipmentRealtime, updateShipmentRealtime } from '../../redux/slices/shipmentSlice';
import { createBid, updateBid, fetchMyBids } from '../../redux/slices/bidSlice';
import { fetchProfile } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { getSocket } from '../../services/socket';
import { getLogisticsDisplayName } from '../../utils/logisticsUtils';
import { 
  Package, Search, Filter, SortAsc, RefreshCw, MapPin, Calendar, Clock, 
  Truck, Weight, Ruler, Shield, Eye, ChevronDown, ChevronUp, 
  Wallet, MessageSquare, User, Phone, FileText, Image, 
  AlertCircle, CheckCircle, Star, TrendingUp, Globe
} from 'lucide-react';

const AvailableShipments = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { currency, formatCurrency, getCurrencySymbol, parseCurrency } = useCurrency();
  const { availableShipments, loading, error } = useSelector((state) => state.shipment);
  const { loading: bidLoading, myBids } = useSelector((state) => state.bid);
  const { user, loading: profileLoading } = useSelector((state) => state.auth); // New: Get user info for context in real-time updates
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  
  // Debug: Log user verification status
  console.log('🔍 AvailableShipments: User verification status:', {
    userId: user?._id,
    verificationStatus: user?.verificationStatus,
    isVerified: user?.isVerified,
    user: user
  });

  // Debug: Log component state
  console.log('🔍 AvailableShipments: Component state:', {
    loading,
    error,
    availableShipments: availableShipments?.length || 0,
    profileLoading,
    isRefreshingProfile
  });

  


  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidEta, setBidEta] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [expandedShipments, setExpandedShipments] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [showEditBidModal, setShowEditBidModal] = useState(false);
  const [editingBid, setEditingBid] = useState(null);

  useEffect(() => {
    dispatch(fetchAvailableShipments());
    
    // Only fetch profile on mount if user data is incomplete or verification status is unknown
    if (!user || !user.verificationStatus) {
      console.log('🔄 Fetching profile on mount - user data incomplete...');
      dispatch(fetchProfile());
    } else {
      console.log('🔄 User data complete, skipping initial profile fetch');
    }

    // Fetch user's bids to check for existing bids
    dispatch(fetchMyBids());
    
    const socket = getSocket();

    // New: Socket.io Listeners
    socket.on('new-shipment', (shipment) => {
        // Only add if it's an open shipment and not created by the current user
        if (shipment.status === 'open' && user && shipment.user._id !== user._id) {
            dispatch(addShipmentRealtime(shipment));
            toast.info(`New shipment available: ${shipment.shipmentTitle}`);
        }
    });

    socket.on('shipment-updated', (shipment) => {
        // Update relevant shipments in the available list
        dispatch(updateShipmentRealtime(shipment));
        if (shipment.user && user && shipment.user._id !== user._id && shipment.status !== 'open') {
            toast.info(`Shipment "${shipment.shipmentTitle}" is no longer available.`);
        }
    });

    // Listen for verification status updates
    socket.on('verification-updated', (userData) => {
        if (userData._id === user?._id) {
            console.log('🔄 Verification status updated via socket:', userData);
            dispatch(fetchProfile());
            toast.success('Your verification status has been updated! You can now place bids.');
        }
    });

    return () => {
      socket.off('new-shipment');
      socket.off('shipment-updated');
      socket.off('verification-updated');
    };
  }, [dispatch, user]); // Include user in dependency array for socket listeners

  // Check if user is verified and can place bids
  const isUserVerified = useCallback(() => {
    // Check both verificationStatus and isVerified fields for better compatibility
    const verificationStatus = user?.verificationStatus;
    const isVerified = user?.isVerified;
    
    console.log('🔍 Verification check:', {
      verificationStatus,
      isVerified,
      isVerifiedResult: verificationStatus === 'verified' || isVerified === true
    });
    
    return verificationStatus === 'verified' || isVerified === true;
  }, [user?.verificationStatus, user?.isVerified]);

  // Auto-refresh verification status every 30 seconds (only if not verified)
  useEffect(() => {
    // Only set up auto-refresh if user is not verified
    if (isUserVerified()) {
      return;
    }

    const interval = setInterval(() => {
      // Don't fetch if already loading
      if (profileLoading || isRefreshingProfile) {
        console.log('🔄 Skipping profile refresh - already loading');
        return;
      }
      
      console.log('🔄 Auto-checking verification status...');
      setIsRefreshingProfile(true);
      dispatch(fetchProfile()).finally(() => {
        setIsRefreshingProfile(false);
      });
    }, 30000); // Check every 30 seconds for faster updates

    return () => clearInterval(interval);
  }, [dispatch, isUserVerified, profileLoading, isRefreshingProfile]);

  const hasBidOnShipment = (shipmentId) => {
    return myBids.some(bid => 
      bid.shipment._id === shipmentId && 
      (bid.status === 'pending' || bid.status === 'accepted')
    );
  };

  const getBidForShipment = (shipmentId) => {
    return myBids.find(bid => 
      bid.shipment._id === shipmentId && 
      (bid.status === 'pending' || bid.status === 'accepted')
    );
  };

  const handlePlaceBidClick = (shipmentId) => {
    setSelectedShipmentId(shipmentId);
    setShowBidModal(true);
  };

  const handleEditBidClick = (shipmentId) => {
    const existingBid = getBidForShipment(shipmentId);
    if (existingBid) {
      setEditingBid(existingBid);
      setBidPrice(existingBid.price.toString());
      setBidEta(existingBid.eta);
      setBidMessage(existingBid.message || '');
      setSelectedShipmentId(shipmentId);
      setShowEditBidModal(true);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidPrice || !bidEta || !selectedShipmentId) {
      toast.error('Please fill in price and ETA.');
      return;
    }

    const bidData = {
      shipmentId: selectedShipmentId,
      price: parseCurrency(bidPrice, currency),
      currency: currency,
      eta: bidEta,
      message: bidMessage,
    };
    
    const result = await dispatch(createBid(bidData));
    if (createBid.fulfilled.match(result)) {
      setShowBidModal(false);
      setBidPrice('');
      setBidEta('');
      setBidMessage('');
      toast.success('Bid submitted successfully!');
    } else if (createBid.rejected.match(result)) {
      // Handle verification error specifically
      if (result.payload && result.payload.includes('verification')) {
        toast.error('Your account is pending verification. Please wait for admin approval before posting bids.');
      } else if (result.payload && result.payload.includes('already placed a bid')) {
        toast.error('You have already placed a bid on this shipment. You can edit your existing bid instead.');
      } else {
        toast.error(result.payload || 'Failed to submit bid. Please try again.');
      }
    }
  };

  const handleEditBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidPrice || !bidEta || !editingBid) {
      toast.error('Please fill in price and ETA.');
      return;
    }

    const bidData = {
      price: parseCurrency(bidPrice, currency),
      currency: currency,
      eta: bidEta,
      message: bidMessage,
    };
    
    const result = await dispatch(updateBid({ bidId: editingBid._id, bidData }));
    if (updateBid.fulfilled.match(result)) {
      setShowEditBidModal(false);
      setEditingBid(null);
      setBidPrice('');
      setBidEta('');
      setBidMessage('');
      toast.success('Bid updated successfully!');
    } else if (updateBid.rejected.match(result)) {
      toast.error(result.payload || 'Failed to update bid. Please try again.');
    }
  };


  const toggleShipmentDetails = (shipmentId) => {
    setExpandedShipments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shipmentId)) {
        newSet.delete(shipmentId);
      } else {
        newSet.add(shipmentId);
      }
      return newSet;
    });
  };

  // Filter and sort shipments
  const filteredAndSortedShipments = availableShipments
    .filter(shipment => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        shipment.shipmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.typeOfGoods.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.pickupCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.deliveryCity.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'withAttachments' && (shipment.photos?.length > 0 || shipment.documents?.length > 0)) ||
        (filterBy === 'noAttachments' && (!shipment.photos?.length && !shipment.documents?.length));
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'deliveryDate':
          return new Date(a.preferredDeliveryDate) - new Date(b.preferredDeliveryDate);
        case 'title':
          return a.shipmentTitle.localeCompare(b.shipmentTitle);
        default:
          return 0;
      }
    });

  // Debug: Log render state
  console.log('🔍 AvailableShipments: Render state check:', {
    loading,
    error,
    hasAvailableShipments: availableShipments && availableShipments.length > 0,
    willShowLoading: loading,
    willShowError: error
  });


  if (loading) {
    console.log('🔍 AvailableShipments: Showing loading state');
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Loading Available Shipments</h3>
              <p className="text-gray-600 dark:text-gray-400">Finding the best opportunities for you...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('🔍 AvailableShipments: Showing error state:', error);
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Error Loading Shipments</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => dispatch(fetchAvailableShipments())}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className="inline-block mr-2" size={20} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('🔍 AvailableShipments: About to render main component');
  
  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <Package className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Available Shipments</h1>
                  <p className="text-indigo-100 text-lg">Discover and bid on shipments from shippers worldwide</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Verification Status Indicator */}
                {!isUserVerified() ? (
                  <div className={`backdrop-blur-sm rounded-xl px-4 py-2 border ${
                    user?.verificationStatus === 'rejected' 
                      ? 'bg-red-500/20 border-red-300/30' 
                      : 'bg-orange-500/20 border-orange-300/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-white" />
                      <span className="text-white font-semibold text-sm">
                        {user?.verificationStatus === 'rejected' 
                          ? 'Verification Rejected' 
                          : 'Verification Pending'
                        }
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-300/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-white" />
                      <span className="text-white font-semibold text-sm">
                        Verified
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold text-lg">
                    {availableShipments.length} opportunities
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (profileLoading || isRefreshingProfile) {
                      console.log('🔄 Profile refresh already in progress...');
                      return;
                    }
                    console.log('🔄 Manual verification status refresh...');
                    setIsRefreshingProfile(true);
                    dispatch(fetchProfile()).finally(() => {
                      setIsRefreshingProfile(false);
                    });
                  }}
                  disabled={profileLoading || isRefreshingProfile}
                  className={`px-4 py-2 backdrop-blur-sm text-white rounded-xl transition-all duration-300 flex items-center gap-2 border border-white/20 ${
                    profileLoading || isRefreshingProfile 
                      ? 'bg-white/10 cursor-not-allowed opacity-50' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  title="Refresh verification status"
                >
                  <Shield size={16} className="text-white" />
                  <span className="text-white font-medium">
                    {profileLoading || isRefreshingProfile ? 'Checking...' : 'Check Status'}
                  </span>
                </button>
                <button
                  onClick={() => dispatch(fetchAvailableShipments())}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                >
                  <RefreshCw size={16} className="text-white" />
                  <span className="text-white font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search shipments by title, type, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Shipments</option>
                <option value="withAttachments">With Attachments</option>
                <option value="noAttachments">No Attachments</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deliveryDate">Delivery Date</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                Showing {filteredAndSortedShipments.length} of {availableShipments.length} shipments
              </span>
              {(searchTerm || filterBy !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                    setSortBy('newest');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                >
                  <Filter size={16} />
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp size={16} />
              <span>Real-time updates</span>
            </div>
          </div>
        </div>
      
        {filteredAndSortedShipments.length > 0 ? (
          <div className="space-y-6">
            {filteredAndSortedShipments.map((shipment, index) => {
              const isExpanded = expandedShipments.has(shipment._id);
              
              return (
                <div
                  key={shipment._id}
                  className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Compact Header View */}
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Left Side - Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                              📦
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                              {shipment.shipmentTitle}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="text-gray-400" size={16} />
                              <span className="text-gray-600 font-medium text-lg">
                                {shipment.routeSummary}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="text-blue-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Type</div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{shipment.typeOfGoods}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Weight className="text-green-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Weight</div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{shipment.weightSummary || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Ruler className="text-purple-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Quantity</div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{shipment.quantitySummary}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Truck className="text-orange-600" size={16} />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Mode</div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{shipment.modeOfTransport}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Actions & Status */}
                      <div className="flex flex-col items-end gap-4">
                        {/* Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {shipment.urgency && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              shipment.urgencyColor === 'red' ? 'bg-red-100 text-red-800 border-red-200' :
                              shipment.urgencyColor === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              ⚡ {shipment.urgency} Priority
                            </span>
                          )}
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                            {shipment.status}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
                            Open for Bidding
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          {(shipment.photos?.length > 0 || shipment.documents?.length > 0) && !isExpanded && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold border border-pink-200">
                              <FileText size={12} />
                              <span>{(shipment.photos?.length || 0) + (shipment.documents?.length || 0)} files</span>
                            </div>
                          )}
                          <button
                            onClick={() => toggleShipmentDetails(shipment._id)}
                            title={isExpanded ? "Hide detailed shipment information" : "View complete shipment details including photos and documents"}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 ${
                              isExpanded 
                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                            }`}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={16} />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <Eye size={16} />
                                View Details
                              </>
                            )}
                          </button>
                          {!isUserVerified() ? (
                            <div className="flex flex-col items-end">
                              <button 
                                disabled
                                className={`px-6 py-3 text-white rounded-xl cursor-not-allowed font-semibold shadow-lg flex items-center gap-2 ${
                                  user?.verificationStatus === 'rejected' 
                                    ? 'bg-red-500' 
                                    : 'bg-orange-500'
                                }`}
                              >
                                <AlertCircle size={16} />
                                {user?.verificationStatus === 'rejected' 
                                  ? 'Verification Rejected' 
                                  : 'Verification Pending'
                                }
                              </button>
                              <p className="text-xs text-gray-500 mt-1 text-right max-w-32">
                                {user?.verificationStatus === 'rejected' 
                                  ? 'Contact admin for assistance' 
                                  : 'Wait for admin approval to place bids'
                                }
                              </p>
                              <p className="text-xs text-gray-400 mt-2 text-center">
                                {user?.verificationStatus === 'rejected' 
                                  ? 'Please resolve verification issues' 
                                  : 'Status will update automatically when verified'
                                }
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              {hasBidOnShipment(shipment._id) ? (
                                <button 
                                  onClick={() => handleEditBidClick(shipment._id)}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                  disabled={bidLoading}
                                >
                                  <Wallet size={16} />
                                  Edit Bid
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handlePlaceBidClick(shipment._id)}
                                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                  disabled={bidLoading}
                                >
                                  {bidLoading && selectedShipmentId === shipment._id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      Placing Bid...
                                    </>
                                  ) : (
                                    <>
                                      <Wallet size={16} />
                                      Place Bid
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipper Info */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="text-gray-400" size={16} />
                            <span className="text-gray-600 font-medium">Shipper:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {getLogisticsDisplayName(shipment.user)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="text-gray-400" size={16} />
                            <span className="text-gray-600">{shipment.user.country}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-gray-400" size={14} />
                            <span>Posted: {shipment.formattedCreatedDate}</span>
                          </div>
                          {(shipment.photos?.length > 0 || shipment.documents?.length > 0) && (
                            <div className="flex items-center gap-1 text-pink-600">
                              <FileText size={14} />
                              <span>{shipment.photos?.length || 0} photos, {shipment.documents?.length || 0} docs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Expandable Detailed View */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6">
                      {/* Key Information Summary */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                          🎯 Key Information for Logistics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Route</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.routeSummary}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Pickup Date</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.formattedPickupDate}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Delivery Date</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.formattedDeliveryDate}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Transport Mode</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.modeOfTransport}</div>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Goods Type</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.typeOfGoods}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Insurance Required</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.insuranceRequired}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Goods & Transport */}
                        <div className="space-y-6">
                          {/* Goods Information */}
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              📦 Goods Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium text-gray-600">Type:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.typeOfGoods}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Description:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.descriptionOfGoods}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Quantity:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.quantitySummary}</span>
                              </p>
                              {shipment.weight && (
                                <p><span className="font-medium text-gray-600">Weight:</span> 
                                  <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.weightSummary}</span>
                                </p>
                              )}
                              {shipment.dimensions && (
                                <p><span className="font-medium text-gray-600">Dimensions:</span> 
                                  <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.dimensions}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Transport Details */}
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              🚚 Transport Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium text-gray-600">Mode:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.modeOfTransport}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Insurance:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.insuranceRequired}</span>
                              </p>
                              {shipment.handlingInstructions && (
                                <p><span className="font-medium text-gray-600">Handling:</span> 
                                  <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.handlingInstructions}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Location Details */}
                        <div className="space-y-6">
                          {/* Pickup Details */}
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              📍 Pickup Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium text-gray-600">Address:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.pickupAddress}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">City:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.pickupCity}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Country:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.pickupCountry}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Contact:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.pickupContactPerson}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Phone:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.pickupPhoneNumber}</span>
                              </p>
                            </div>
                          </div>

                          {/* Delivery Details */}
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              🎯 Delivery Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium text-gray-600">Address:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.deliveryAddress}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">City:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.deliveryCity}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Country:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.deliveryCountry}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Date:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.formattedDeliveryDate}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Contact:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.deliveryContactPerson}</span>
                              </p>
                              <p><span className="font-medium text-gray-600">Phone:</span> 
                                <span className="ml-2 text-gray-800 dark:text-gray-200">{shipment.deliveryPhoneNumber}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photos Section */}
                      {shipment.photos && shipment.photos.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            📸 Photos ({shipment.photos.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {shipment.photos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={`http://localhost:5000/${photo}`}
                                  alt={`Shipment photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                  onClick={() => window.open(`http://localhost:5000/${photo}`, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Click to view</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      {shipment.documents && shipment.documents.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            📄 Documents ({shipment.documents.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shipment.documents.map((document, index) => (
                              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-colors">
                                <div className="flex-shrink-0 mr-4">
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {document.split('/').pop()}
                                  </p>
                                  <p className="text-sm text-gray-500">Document</p>
                                </div>
                                <div className="flex-shrink-0">
                                  <button
                                    onClick={() => window.open(`http://localhost:5000/${document}`, '_blank')}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-mono text-xs text-gray-400">Shipment ID: {shipment._id.slice(-8)}</span>
                          </div>
                          <div className="flex gap-3">
                            {hasBidOnShipment(shipment._id) ? (
                              <button 
                                onClick={() => handleEditBidClick(shipment._id)}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                disabled={bidLoading}
                              >
                                <span>✏️</span>
                                Edit Your Bid
                              </button>
                            ) : (
                              <button 
                                onClick={() => handlePlaceBidClick(shipment._id)}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                disabled={bidLoading}
                              >
                                {bidLoading && selectedShipmentId === shipment._id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Placing Bid...
                                  </>
                                ) : (
                                  <>
                                    <span>💰</span>
                                    Place Your Bid
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">
                  {searchTerm || filterBy !== 'all' ? '🔍' : '📦'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {searchTerm || filterBy !== 'all' ? 'No Matching Shipments' : 'No Shipments Available'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find more shipments.'
                  : 'Check back later for new bidding opportunities!'
                }
              </p>
              {(searchTerm || filterBy !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                    setSortBy('newest');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Filter className="inline-block mr-2" size={20} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Bid Modal */}
        {showBidModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white p-8 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      <Wallet className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Place Your Bid</h3>
                      <p className="text-indigo-100">Submit your competitive offer for this shipment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBidModal(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                  >
                    <span className="text-white text-xl font-bold">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {/* Shipment Summary */}
                {(() => {
                  const shipment = availableShipments.find(s => s._id === selectedShipmentId);
                  if (!shipment) return null;
                  
                  return (
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                      <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                        <Package className="text-indigo-600" size={20} />
                        Shipment Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="text-blue-600" size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 font-medium">Title</div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.shipmentTitle}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <MapPin className="text-green-600" size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 font-medium">Route</div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.routeSummary}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Truck className="text-purple-600" size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 font-medium">Type</div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.typeOfGoods}</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Calendar className="text-orange-600" size={16} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Calendar className="text-green-600" size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 font-medium">Delivery</div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.formattedDeliveryDate}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <User className="text-indigo-600" size={16} />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 font-medium">Shipper</div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.user.companyName || shipment.user.name}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Photos Section */}
                      {shipment.photos && shipment.photos.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-blue-200">
                          <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Image className="text-pink-600" size={16} />
                            Photos ({shipment.photos.length})
                          </h5>
                          <div className="flex flex-wrap gap-3">
                            {shipment.photos.slice(0, 4).map((photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={`http://localhost:5000/${photo}`}
                                  alt={`Shipment photo ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                                  onClick={() => window.open(`http://localhost:5000/${photo}`, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl flex items-center justify-center">
                                  <Eye className="text-white opacity-0 group-hover:opacity-100" size={16} />
                                </div>
                              </div>
                            ))}
                            {shipment.photos.length > 4 && (
                              <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-white shadow-lg flex items-center justify-center text-xs text-gray-600 font-semibold">
                                +{shipment.photos.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Documents Section */}
                      {shipment.documents && shipment.documents.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-blue-200">
                          <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FileText className="text-blue-600" size={16} />
                            Documents ({shipment.documents.length})
                          </h5>
                          <div className="flex flex-wrap gap-3">
                            {shipment.documents.map((document, index) => (
                              <button
                                key={index}
                                onClick={() => window.open(`http://localhost:5000/${document}`, '_blank')}
                                className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-xl hover:bg-blue-200 transition-colors font-medium flex items-center gap-2 border border-blue-200"
                              >
                                <FileText size={14} />
                                {document.split('/').pop()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Bid Form */}
                <form onSubmit={handleBidSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="bidPrice">
                        <Wallet className="text-green-600" size={16} />
                        Your Bid Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                          {getCurrencySymbol()}
                        </span>
                        <input
                          type="text"
                          id="bidPrice"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                          value={bidPrice}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[^\d.,]/g, '');
                            setBidPrice(cleanValue);
                          }}
                          placeholder="Enter your bid amount"
                          required
                        />
                      </div>
                    </div>
                    
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="bidEta">
                        <Clock className="text-blue-600" size={16} />
                        Estimated Time of Arrival
                      </label>
                      <input
                        type="text"
                        id="bidEta"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        value={bidEta}
                        onChange={(e) => setBidEta(e.target.value)}
                        placeholder="e.g., 3 days, 24 hours"
                        required
                      />
                    </div>
                  </div>


                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="bidMessage">
                      <MessageSquare className="text-purple-600" size={16} />
                      Additional Message (Optional)
                    </label>
                    <textarea
                      id="bidMessage"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      placeholder="Describe your service, experience, or any special conditions..."
                    ></textarea>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <Eye size={14} />
                      This message will be visible to the shipper when reviewing your bid.
                    </p>
                  </div>

                  {/* Bid Tips */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <Star className="text-yellow-500" size={16} />
                      Bidding Tips
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="text-sm text-blue-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="text-green-500" size={14} />
                          Consider all costs: fuel, tolls, insurance
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="text-green-500" size={14} />
                          Factor in urgency and complexity
                        </li>
                      </ul>
                      <ul className="text-sm text-blue-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="text-green-500" size={14} />
                          Be competitive but ensure profitability
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="text-green-500" size={14} />
                          Provide realistic ETA based on capabilities
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Bid Summary */}
                  {bidPrice && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        Bid Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <div className="text-sm text-gray-600 mb-1">Bid Amount</div>
                          <div className="text-2xl font-bold text-green-700">
                            {bidPrice}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <div className="text-sm text-gray-600 mb-1">Currency</div>
                          <div className="text-lg font-semibold text-gray-800">
                            {currency}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <div className="text-sm text-gray-600 mb-1">ETA</div>
                          <div className="text-lg font-semibold text-gray-800">
                            {bidEta || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowBidModal(false)}
                      className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                      disabled={bidLoading}
                    >
                      {bidLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Wallet size={16} />
                          Submit Bid
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Bid Modal */}
        {showEditBidModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white p-8 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      <Wallet className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Edit Your Bid</h3>
                      <p className="text-indigo-100">Update your offer for this shipment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditBidModal(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                  >
                    <span className="text-white text-xl font-bold">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {/* Shipment Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="text-blue-600" size={20} />
                    Shipment Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Title</div>
                      <div className="font-semibold text-gray-800">{selectedShipment?.shipmentTitle}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Route</div>
                      <div className="font-semibold text-gray-800">{selectedShipment?.routeSummary}</div>
                    </div>
                  </div>
                </div>

                {/* Edit Bid Form */}
                <form onSubmit={handleEditBidSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="editBidPrice">
                        <Wallet className="text-green-600" size={16} />
                        Your Bid Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                          {getCurrencySymbol()}
                        </span>
                        <input
                          type="text"
                          id="editBidPrice"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                          value={bidPrice}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[^\d.,]/g, '');
                            setBidPrice(cleanValue);
                          }}
                          placeholder="Enter your bid amount"
                          required
                        />
                      </div>
                    </div>
                    
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="editBidEta">
                        <Clock className="text-blue-600" size={16} />
                        Estimated Time of Arrival
                      </label>
                      <input
                        type="text"
                        id="editBidEta"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        value={bidEta}
                        onChange={(e) => setBidEta(e.target.value)}
                        placeholder="e.g., 3 days, 24 hours"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="editBidMessage">
                      <MessageSquare className="text-purple-600" size={16} />
                      Additional Message (Optional)
                    </label>
                    <textarea
                      id="editBidMessage"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      placeholder="Add any additional information about your bid..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowEditBidModal(false)}
                      className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                      disabled={bidLoading}
                    >
                      {bidLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Wallet size={16} />
                          Update Bid
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableShipments;

