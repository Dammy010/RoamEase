import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchShipmentDetailsById } from '../../redux/slices/shipmentSlice';
import { fetchBidsForShipment, acceptBid, rejectBid } from '../../redux/slices/bidSlice';
import { toast } from 'react-toastify';
import { 
  CheckCircle, XCircle, MessageCircle, Package, MapPin, Calendar, 
  Clock, Truck, User, Phone, Mail, Star, Filter, Search, 
  ArrowLeft, RefreshCw, AlertCircle, Globe, FileText, 
  TrendingUp, Award, Shield, Zap, DollarSign, MessageSquare
} from 'lucide-react';
import api from '../../services/api';

const AcceptRejectBidPage = () => {
  const { shipmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentShipment, loading: shipmentLoading, error: shipmentError } = useSelector(state => state.shipment);
  const { bids, loading: bidsLoading, error: bidsError } = useSelector(state => state.bid);
  const { user } = useSelector((state) => state.auth);

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
    return symbols[currency] || '$';
  };

  // Debug logging
  console.log("AcceptRejectBidPage Debug:");
  console.log("currentShipment:", currentShipment);
  console.log("shipmentLoading:", shipmentLoading);
  console.log("shipmentError:", shipmentError);
  console.log("bids:", bids);
  console.log("bidsLoading:", bidsLoading);
  console.log("bidsError:", bidsError);

  const [selectedBid, setSelectedBid] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPriceNegotiationModal, setShowPriceNegotiationModal] = useState(false);
  const [requestedPrice, setRequestedPrice] = useState('');
  const [priceRequestLoading, setPriceRequestLoading] = useState(false);

  // Filter bids based on selected status and search term
  const filteredBids = useMemo(() => {
    return bids.filter(bid => {
      const matchesStatus = filterStatus === 'all' || 
        String(bid?.status || '').toLowerCase() === String(filterStatus).toLowerCase();
      
      const matchesSearch = !searchTerm || 
        (bid?.carrier?.companyName || bid?.carrier?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bid?.message || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [bids, filterStatus, searchTerm]);

  // Check if current user is the owner of the shipment
  const isOwner = user && currentShipment && currentShipment.user && currentShipment.user._id === user._id;

  useEffect(() => {
    if (shipmentId) {
      dispatch(fetchShipmentDetailsById(shipmentId));
      dispatch(fetchBidsForShipment(shipmentId));
    }
  }, [dispatch, shipmentId]);

  useEffect(() => {
    if (filteredBids.length > 0 && (!selectedBid || !filteredBids.some(b => b._id === selectedBid._id))) {
      const initialSelectedBid = filteredBids.find(bid => bid.status === 'pending') || 
                                filteredBids.find(bid => bid.status === 'accepted') || 
                                filteredBids[0];
      setSelectedBid(initialSelectedBid);
    } else if (filteredBids.length === 0) {
      setSelectedBid(null);
    }
  }, [filteredBids, selectedBid]);

  const handleAcceptBid = async (bidId) => {
    if (!bidId) return;
    try {
      const result = await dispatch(acceptBid(bidId)).unwrap();
      toast.success('Bid accepted successfully!');
      if (result.conversationId) {
        navigate(`/user/chat/${result.conversationId}`);
      } else {
        navigate(`/user/my-shipments`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept bid');
    }
  };

  const handlePriceNegotiation = (bid) => {
    setSelectedBid(bid);
    setRequestedPrice(bid.bidAmount.toString());
    setShowPriceNegotiationModal(true);
  };

  const handleAcceptAtCurrentPrice = async () => {
    if (!selectedBid) return;
    try {
      const result = await dispatch(acceptBid(selectedBid._id)).unwrap();
      toast.success('Bid accepted at current price!');
      setShowPriceNegotiationModal(false);
      if (result.conversationId) {
        navigate(`/user/chat/${result.conversationId}`);
      } else {
        navigate(`/user/my-shipments`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept bid');
    }
  };

  const handleRequestPriceUpdate = async () => {
    if (!selectedBid || !requestedPrice) {
      toast.error('Please enter a requested price');
      return;
    }

    const requestedAmount = parseFloat(requestedPrice);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setPriceRequestLoading(true);
    try {
      const response = await api.post(`/bids/${selectedBid._id}/request-price-update`, {
        requestedPrice: requestedAmount,
        currency: selectedBid.currency || 'USD'
      });
      
      toast.success(`Price update request sent to ${selectedBid.logisticsCompany?.companyName || 'logistics company'}!`);
      setShowPriceNegotiationModal(false);
      setRequestedPrice('');
      
      // Refresh bids to show updated status
      dispatch(fetchBidsForShipment(shipmentId));
    } catch (error) {
      console.error('Error requesting price update:', error);
      toast.error(error.response?.data?.message || 'Failed to send price update request');
    } finally {
      setPriceRequestLoading(false);
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!bidId) return;
    try {
      await dispatch(rejectBid(bidId)).unwrap();
      toast.success('Bid rejected successfully!');
      navigate(`/user/my-shipments`);
    } catch (err) {
      toast.error(err.message || 'Failed to reject bid');
    }
  };

  const handleStartChat = async (bid) => {
    if (bid.conversationId) {
      navigate(`/user/chat/${bid.conversationId}`);
    } else {
      try {
        const response = await api.post('/chat/conversations', {
          recipientId: bid.carrier._id,
          shipmentId: shipmentId
        });
        navigate(`/user/chat/${response.data._id}`);
      } catch (error) {
        toast.error("Failed to start chat. Please try again.");
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected': return <XCircle className="text-red-500" size={16} />;
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      default: return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  if (shipmentLoading || bidsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Bids</h3>
          <p className="text-gray-500">Please wait while we fetch the bid details...</p>
        </div>
      </div>
    );
  }

  if (shipmentError || bidsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Bids</h3>
          <p className="text-gray-500 mb-4">{shipmentError || bidsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentShipment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Shipment Not Found</h3>
          <p className="text-gray-500 mb-4">The shipment you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/user/my-shipments')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium"
          >
            Back to My Shipments
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-4">You don't have permission to manage bids for this shipment.</p>
          <button
            onClick={() => navigate('/user/my-shipments')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium"
          >
            Back to My Shipments
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
          <button
            onClick={() => navigate("/user/my-shipments")}
            className="mb-6 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft size={16} />
            Back to My Shipments
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                  <Package className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Manage Bids</h1>
                  <p className="text-indigo-100">Review and manage bids for your shipment</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {currentShipment ? (
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{currentShipment.shipmentTitle || 'N/A'}</h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>{currentShipment.pickupCity || 'N/A'} → {currentShipment.deliveryCity || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Posted: {currentShipment.createdAt ? new Date(currentShipment.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Truck size={16} />
                      <span>Type: {currentShipment.typeOfGoods || currentShipment.modeOfTransport || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package size={16} />
                      <span>Weight: {currentShipment.weight || 'N/A'} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={16} />
                      <span>Budget: {getCurrencySymbol(currentShipment.budgetCurrency || 'USD')}{currentShipment.budget || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Loading Shipment Details</h3>
                  <p className="text-gray-500">Please wait while we fetch the shipment information...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Selected Bid Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star size={20} />
                  Selected Bid Details
                </h2>
              </div>
              
              <div className="p-6">
                {selectedBid ? (
                  <div className="space-y-6">
                    {/* Bid Price */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {getCurrencySymbol(selectedBid.currency || 'USD')}{selectedBid.price?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-lg text-gray-600">Bid Amount</div>
                    </div>

                    {/* Bid Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Clock className="text-blue-500" size={20} />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">Estimated Delivery</div>
                          <div className="text-gray-600">{selectedBid.eta || 'N/A'}</div>
                        </div>
                      </div>
                      

                      {selectedBid.message && (
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                            <MessageSquare size={16} />
                            Message
                          </div>
                          <div className="text-gray-600">{selectedBid.message}</div>
                        </div>
                      )}
                    </div>

                    {/* Carrier Info */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <User size={16} />
                        Carrier Information
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          {selectedBid.carrier?.companyName || selectedBid.carrier?.name || 'Unknown Carrier'}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail size={14} />
                          {selectedBid.carrier?.email || 'N/A'}
                        </div>
                        {selectedBid.carrier?.phone && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone size={14} />
                            {selectedBid.carrier.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center">
                      <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusColor(selectedBid.status)}`}>
                        {getStatusIcon(selectedBid.status)}
                        <span className="font-medium capitalize">{selectedBid.status}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {selectedBid.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handlePriceNegotiation(selectedBid)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                        >
                          <CheckCircle size={18} />
                          Accept Bid
                        </button>
                        <button
                          onClick={() => handleRejectBid(selectedBid._id)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                        >
                          <XCircle size={18} />
                          Reject Bid
                        </button>
                      </div>
                    )}

                    {/* Chat Button */}
                    {selectedBid.status !== 'rejected' && (
                      <button
                        onClick={() => handleStartChat(selectedBid)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={18} />
                        {selectedBid.status === 'accepted' ? 'Continue Chat' : 'Start Chat'}
                      </button>
                    )}

                    {selectedBid.status === 'rejected' && (
                      <div className="w-full px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-center">
                        Chat not available for rejected bids
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bid Selected</h3>
                    <p className="text-gray-500">Click on a bid from the list to view its details</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bids List */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp size={20} />
                  All Bids ({filteredBids.length})
                </h2>
              </div>
              
              <div className="p-6">
                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by carrier name or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'accepted', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          filterStatus === status
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'all' ? `All (${bids.length})` : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bids List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredBids.length > 0 ? (
                    filteredBids.map((bid) => (
                      <div
                        key={bid._id}
                        onClick={() => setSelectedBid(bid)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedBid?._id === bid._id
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            {getCurrencySymbol(bid.currency || 'USD')}{bid.price?.toFixed(2) || 'N/A'}
                            {bid.currency && <span className="text-sm text-gray-500 ml-1">({bid.currency})</span>}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(bid.status)}`}>
                            {getStatusIcon(bid.status)}
                            {bid.status?.charAt(0).toUpperCase() + bid.status?.slice(1) || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>ETA: {bid.eta || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                          </div>
                          <div className="text-sm text-gray-600">
                            By: {bid.carrier?.companyName || bid.carrier?.name || 'Unknown Carrier'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="text-gray-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bids Found</h3>
                      <p className="text-gray-500">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'No bids have been placed on this shipment yet'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Bid Confirmation Modal */}
      {showPriceNegotiationModal && selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Accept Bid
                </h3>
                <button
                  onClick={() => setShowPriceNegotiationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Bid Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Company:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBid.logisticsCompany?.companyName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Price:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getCurrencySymbol(selectedBid.currency || 'USD')}{selectedBid.bidAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">ETA:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBid.eta || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Do you accept the requested price?
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    You can either accept this bid or request a price update from the logistics company.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Preferred Price ({selectedBid.currency || 'USD'})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {getCurrencySymbol(selectedBid.currency || 'USD')}
                      </span>
                      <input
                        type="number"
                        value={requestedPrice}
                        onChange={(e) => setRequestedPrice(e.target.value)}
                        placeholder="Enter your preferred price"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAcceptAtCurrentPrice}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Accept at Current Price
                </button>
                
                <button
                  onClick={handleRequestPriceUpdate}
                  disabled={priceRequestLoading || !requestedPrice}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {priceRequestLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} />
                      Request Price Update
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                The logistics company will be notified of your decision.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptRejectBidPage;