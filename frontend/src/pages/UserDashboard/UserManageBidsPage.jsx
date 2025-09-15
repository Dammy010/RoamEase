import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../contexts/CurrencyContext';
import { fetchBidsOnMyShipments, acceptBid, rejectBid } from '../../redux/slices/bidSlice';
import { toast } from 'react-toastify';
import { 
  CheckCircle, XCircle, MessageCircle, Package, MapPin, Calendar, 
  Clock, Truck, User, Phone, Mail, Star, Filter, Search, 
  RefreshCw, AlertCircle, Globe, FileText, 
  TrendingUp, Award, Shield, Zap, Wallet, MessageSquare,
  Eye, MoreVertical, Building2
} from 'lucide-react';
import api from '../../services/api';

const UserManageBidsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getCurrencySymbol } = useCurrency();
  const { bids, loading, error } = useSelector(state => state.bid);
  const { user } = useSelector((state) => state.auth);


  const [selectedBid, setSelectedBid] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Debug logging
  console.log("UserManageBidsPage Debug:");
  console.log("bids:", bids);
  console.log("loading:", loading);
  console.log("error:", error);
  console.log("user:", user);
  
  // Debug selected bid shipment data
  if (selectedBid) {
    console.log("Selected bid shipment data:", selectedBid.shipment);
    console.log("Type of goods:", selectedBid.shipment?.typeOfGoods);
    console.log("Mode of transport:", selectedBid.shipment?.modeOfTransport);
    console.log("All shipment fields:", Object.keys(selectedBid.shipment || {}));
  }

  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchBidsOnMyShipments());
    }
  }, [dispatch, user]);

  // Filter and sort bids
  const filteredAndSortedBids = useMemo(() => {
    let filtered = bids.filter(bid => {
      const matchesStatus = filterStatus === 'all' || 
        String(bid?.status || '').toLowerCase() === String(filterStatus).toLowerCase();
      
      const matchesSearch = !searchTerm || 
        (bid?.carrier?.companyName || bid?.carrier?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bid?.shipment?.shipmentTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bid?.message || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });

    // Sort bids
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'eta':
          return (a.eta || '').localeCompare(b.eta || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [bids, filterStatus, searchTerm, sortBy]);

  useEffect(() => {
    if (filteredAndSortedBids.length > 0 && (!selectedBid || !filteredAndSortedBids.some(b => b._id === selectedBid._id))) {
      const initialSelectedBid = filteredAndSortedBids.find(bid => bid.status === 'pending') || 
                                filteredAndSortedBids.find(bid => bid.status === 'accepted') || 
                                filteredAndSortedBids[0];
      setSelectedBid(initialSelectedBid);
    } else if (filteredAndSortedBids.length === 0) {
      setSelectedBid(null);
    }
  }, [filteredAndSortedBids, selectedBid]);

  const handleAcceptBid = async (bidId) => {
    if (!bidId) return;
    try {
      const result = await dispatch(acceptBid(bidId)).unwrap();
      toast.success('Bid accepted successfully!');
      if (result.conversationId) {
        navigate(`/user/chat/${result.conversationId}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!bidId) return;
    try {
      await dispatch(rejectBid(bidId)).unwrap();
      toast.success('Bid rejected successfully!');
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
          shipmentId: bid.shipment._id
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Bids</h3>
          <p className="text-gray-500">Please wait while we fetch your bids...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Bids</h3>
          <p className="text-gray-500 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Manage Bids</h1>
                  <p className="text-indigo-100 text-sm">Review and manage all bids on your shipments</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{bids.length}</div>
                  <div className="text-sm text-gray-600">Total Bids</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {bids.filter(bid => bid.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {bids.filter(bid => bid.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
              </div>
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
                      <div className="text-lg text-gray-600">
                        Bid Amount {selectedBid.currency && `(${selectedBid.currency})`}
                      </div>
                    </div>

                    {/* Shipment Info */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <Package size={16} />
                        Shipment Information
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{selectedBid.shipment?.shipmentTitle || 'N/A'}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin size={14} />
                          {selectedBid.shipment?.pickupCity || selectedBid.shipment?.pickupAddress || 'N/A'} → {selectedBid.shipment?.deliveryCity || selectedBid.shipment?.deliveryAddress || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Truck size={14} />
                          {selectedBid.shipment?.typeOfGoods || selectedBid.shipment?.modeOfTransport || 'N/A'}
                        </div>
                        {selectedBid.shipment?.weight && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Package size={14} />
                            Weight: {selectedBid.shipment.weight} kg
                          </div>
                        )}
                        {selectedBid.shipment?.budget && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Wallet size={14} />
                            Budget: {getCurrencySymbol(selectedBid.shipment.budgetCurrency || 'USD')}{selectedBid.shipment.budget}
                            {selectedBid.shipment.budgetCurrency && ` (${selectedBid.shipment.budgetCurrency})`}
                          </div>
                        )}
                      </div>
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
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <Building2 size={16} />
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
                          onClick={() => handleAcceptBid(selectedBid._id)}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Accept Bid
                        </button>
                        <button
                          onClick={() => handleRejectBid(selectedBid._id)}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
                  All Bids ({filteredAndSortedBids.length})
                </h2>
              </div>
              
              <div className="p-6">
                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by carrier, shipment, or message..."
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

                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="eta">ETA</option>
                    </select>
                  </div>
                </div>

                {/* Bids List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAndSortedBids.length > 0 ? (
                    filteredAndSortedBids.map((bid) => (
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
                          <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            {bid.shipment?.shipmentTitle || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {bid.shipment?.pickupCity || bid.shipment?.pickupAddress || 'N/A'} → {bid.shipment?.deliveryCity || bid.shipment?.deliveryAddress || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>ETA: {bid.eta || 'N/A'}</span>
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
                          : 'No bids have been placed on your shipments yet'
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
    </div>
  );
};

export default UserManageBidsPage;