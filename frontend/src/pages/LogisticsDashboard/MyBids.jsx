import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchMyBids, cancelBid, updateBid } from "../../redux/slices/bidSlice";
import { getSocket } from '../../services/socket';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  DollarSign, Clock, MessageSquare, MapPin, Calendar, 
  Package, User, Phone, Eye, RefreshCw, ArrowLeft,
  CheckCircle, XCircle, AlertCircle, TrendingUp, 
  FileText, Image, Globe, Truck, Star
} from 'lucide-react';

const MyBids = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { myBids, loading, error } = useSelector((state) => state.bid);
  const { user } = useSelector((state) => state.auth);
  const [expandedBids, setExpandedBids] = useState(new Set());
  const [showEditBidModal, setShowEditBidModal] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [editBidPrice, setEditBidPrice] = useState('');
  const [editBidCurrency, setEditBidCurrency] = useState('USD');
  const [editBidEta, setEditBidEta] = useState('');
  const [editBidMessage, setEditBidMessage] = useState('');
  const [showPriceResponseModal, setShowPriceResponseModal] = useState(false);
  const [respondingToBid, setRespondingToBid] = useState(null);
  const [priceResponse, setPriceResponse] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [priceResponseLoading, setPriceResponseLoading] = useState(false);

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

  const toggleExpanded = (bidId) => {
    const newExpanded = new Set(expandedBids);
    if (newExpanded.has(bidId)) {
      newExpanded.delete(bidId);
    } else {
      newExpanded.add(bidId);
    }
    setExpandedBids(newExpanded);
  };

  const handleCancelBid = async (bidId, shipmentTitle) => {
    if (window.confirm(`Are you sure you want to cancel your bid for "${shipmentTitle}"? This action cannot be undone.`)) {
      try {
        const result = await dispatch(cancelBid(bidId));
        if (cancelBid.fulfilled.match(result)) {
          toast.success('Bid cancelled successfully!');
        } else {
          toast.error(result.payload || 'Failed to cancel bid');
        }
      } catch (error) {
        toast.error('Error cancelling bid');
        console.error('Error:', error);
      }
    }
  };

  const handleEditBidClick = (bid) => {
    setEditingBid(bid);
    setEditBidPrice(bid.price.toString());
    setEditBidCurrency(bid.currency || 'USD');
    setEditBidEta(bid.eta);
    setEditBidMessage(bid.message || '');
    setShowEditBidModal(true);
  };

  const handleEditBidSubmit = async (e) => {
    e.preventDefault();
    if (!editBidPrice || !editBidEta || !editingBid) {
      toast.error('Please fill in price and ETA.');
      return;
    }

    const bidData = {
      price: Number(editBidPrice),
      currency: editBidCurrency,
      eta: editBidEta,
      message: editBidMessage,
    };
    
    const result = await dispatch(updateBid({ bidId: editingBid._id, bidData }));
    if (updateBid.fulfilled.match(result)) {
      setShowEditBidModal(false);
      setEditingBid(null);
      setEditBidPrice('');
      setEditBidEta('');
      setEditBidMessage('');
      setEditBidCurrency('USD');
      toast.success('Bid updated successfully!');
    } else if (updateBid.rejected.match(result)) {
      toast.error(result.payload || 'Failed to update bid. Please try again.');
    }
  };

  const handlePriceUpdateRequest = (bid) => {
    setRespondingToBid(bid);
    setNewPrice(bid.priceUpdateRequest?.requestedPrice?.toString() || '');
    setResponseMessage('');
    setPriceResponse('');
    setShowPriceResponseModal(true);
  };

  const handlePriceResponseSubmit = async () => {
    if (!respondingToBid || !priceResponse) {
      toast.error('Please select a response');
      return;
    }

    if (priceResponse === 'accepted' && (!newPrice || parseFloat(newPrice) <= 0)) {
      toast.error('Please enter a valid new price');
      return;
    }

    setPriceResponseLoading(true);
    try {
      const response = await api.put(`/bids/${respondingToBid._id}/respond-price-update`, {
        response: priceResponse,
        newPrice: priceResponse === 'accepted' ? parseFloat(newPrice) : undefined,
        message: responseMessage
      });

      toast.success(`Price update request ${priceResponse} successfully!`);
      setShowPriceResponseModal(false);
      setRespondingToBid(null);
      setPriceResponse('');
      setNewPrice('');
      setResponseMessage('');
      
      // Refresh bids
      dispatch(fetchMyBids());
    } catch (error) {
      console.error('Error responding to price update request:', error);
      toast.error(error.response?.data?.message || 'Failed to respond to price update request');
    } finally {
      setPriceResponseLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  useEffect(() => {
    if (user?.role === 'logistics') {
      dispatch(fetchMyBids());
    }

    const socket = getSocket();

    socket.on('bid-updated', (updatedBid) => {
      toast.info(`Your bid for shipment "${updatedBid.shipment?.shipmentTitle}" was updated!`);
    });

    socket.on('bid-deleted', (data) => {
      toast.info(`Your bid has been cancelled successfully!`);
      // Refresh the bids list to remove the cancelled bid
      dispatch(fetchMyBids());
    });

    return () => {
      socket.off('bid-updated');
      socket.off('bid-deleted');
    };
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Loading Your Bids</h3>
              <p className="text-gray-600 dark:text-gray-400">Fetching your bid history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Error Loading Bids</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => dispatch(fetchMyBids())}
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

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/logistics/dashboard")}
                  className="w-12 h-12 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white dark:bg-gray-800/30 transition-all duration-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-12 h-12 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <DollarSign className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">My Bids</h1>
                  <p className="text-indigo-100 text-base">Track and manage your submitted bids</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold text-base">
                    {myBids.length} bids
                  </span>
                </div>
                <button
                  onClick={() => dispatch(fetchMyBids())}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                >
                  <RefreshCw size={16} className="text-white" />
                  <span className="text-white font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {myBids.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="text-indigo-500 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">No Bids Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven't placed any bids yet. Start by browsing available shipments and submitting your first bid!
              </p>
              <button
                onClick={() => navigate('/logistics/available-shipments')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Available Shipments
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {myBids.map((bid, index) => (
              <div
                key={bid._id}
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Compact Header View */}
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left Side - Bid Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            💰
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors duration-300">
                              {bid.shipment?.shipmentTitle || 'N/A'}
                            </h3>
                            <button
                              onClick={() => toggleExpanded(bid._id)}
                              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                              title={expandedBids.has(bid._id) ? "Hide details" : "Show details"}
                            >
                              {expandedBids.has(bid._id) ? (
                                <>
                                  <ArrowLeft className="rotate-90" size={14} />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ArrowLeft className="-rotate-90" size={14} />
                                  Details
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="text-gray-400" size={16} />
                            <span className="text-gray-600 font-medium text-lg">
                              {bid.shipment?.pickupCity || 'N/A'} → {bid.shipment?.deliveryCity || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bid Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="text-green-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Bid Amount</div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {getCurrencySymbol(bid.currency || 'USD')}{bid.price.toFixed(2)}
                              {bid.currency && <span className="text-xs text-gray-500 ml-1">({bid.currency})</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">ETA</div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{bid.eta}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            {getStatusIcon(bid.status)}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Status</div>
                            <div className={`text-sm font-semibold px-2 py-1 rounded-full text-xs ${getStatusColor(bid.status)}`}>
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipper Info */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="text-gray-400" size={16} />
                            <span className="text-gray-600 font-medium">Shipper:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {bid.shipment?.user?.companyName || bid.shipment?.user?.name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="text-gray-400" size={16} />
                            <span className="text-gray-600">{bid.shipment?.user?.country || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${getStatusColor(bid.status)}`}>
                        {getStatusIcon(bid.status)}
                        <span className="font-semibold text-sm">
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                      </div>
                      {bid.status === 'accepted' && bid.conversationId && (
                        <button
                          onClick={() => navigate(`/logistics/chat/${bid.conversationId}`)}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          View Chat
                        </button>
                      )}
                      {bid.status === 'pending' && (
                        <div className="flex flex-col gap-3">
                          {/* Price Update Request Indicator */}
                          {bid.priceUpdateRequest && bid.priceUpdateRequest.status === 'pending' && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="text-orange-600 dark:text-orange-400" size={16} />
                                <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                                  Price Update Request
                                </span>
                              </div>
                              <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                                Shipper prefers: {getCurrencySymbol(bid.priceUpdateRequest.requestedCurrency || bid.currency)}{bid.priceUpdateRequest.requestedPrice?.toLocaleString()}
                              </p>
                              <button
                                onClick={() => handlePriceUpdateRequest(bid)}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                              >
                                <MessageSquare size={14} />
                                Respond
                              </button>
                            </div>
                          )}
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEditBidClick(bid)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                              <DollarSign size={16} />
                              Edit Bid
                            </button>
                            <button
                              onClick={() => handleCancelBid(bid._id, bid.shipment?.shipmentTitle)}
                              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                              <XCircle size={16} />
                              Cancel Bid
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Detailed View */}
                {expandedBids.has(bid._id) && (
                  <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="p-8">
                      {/* Bid Information Summary */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                          <DollarSign className="text-indigo-600" size={20} />
                          Bid Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Bid Amount</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                              {getCurrencySymbol(bid.currency || 'USD')}{bid.price.toFixed(2)}
                              {bid.currency && <span className="text-sm text-gray-500 ml-1">({bid.currency})</span>}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Estimated Time</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{bid.eta}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Submitted</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Shipment Details */}
                        <div className="space-y-6">
                          {/* Shipment Information */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <Package className="text-blue-600" size={20} />
                              Shipment Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Package className="text-blue-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Title</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{bid.shipment?.shipmentTitle || 'N/A'}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Truck className="text-green-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Type</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{bid.shipment?.typeOfGoods || 'N/A'}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <MapPin className="text-purple-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Route</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {bid.shipment?.pickupCity || 'N/A'} → {bid.shipment?.deliveryCity || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                <div className="text-sm text-gray-500 font-medium mb-1">Description</div>
                                <div className="text-sm text-gray-800 dark:text-gray-200">{bid.shipment?.descriptionOfGoods || 'N/A'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Bid Message */}
                          {bid.message && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <MessageSquare className="text-indigo-600" size={20} />
                                Your Message
                              </h4>
                              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <p className="text-gray-800 dark:text-gray-200">{bid.message}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Shipper Information */}
                        <div className="space-y-6">
                          {/* Shipper Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <User className="text-orange-600" size={20} />
                              Shipper Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <User className="text-orange-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Company/Name</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {bid.shipment?.user?.companyName || bid.shipment?.user?.name || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Globe className="text-blue-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Country</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{bid.shipment?.user?.country || 'N/A'}</div>
                                </div>
                              </div>
                              {bid.shipment?.user?.email && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="text-green-600" size={16} />
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 font-medium">Email</div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{bid.shipment.user.email}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bid Status Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <TrendingUp className="text-purple-600" size={20} />
                              Bid Status
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-600 font-medium">Current Status</span>
                                <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(bid.status)}`}>
                                  {getStatusIcon(bid.status)}
                                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-600 font-medium">Submitted</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {new Date(bid.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {bid.updatedAt !== bid.createdAt && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                  <span className="text-sm text-gray-600 font-medium">Last Updated</span>
                                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {new Date(bid.updatedAt).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photos Section */}
                      {bid.shipment?.photos && bid.shipment.photos.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                            <Image className="text-pink-600" size={20} />
                            Shipment Photos ({bid.shipment.photos.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {bid.shipment.photos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={`http://localhost:5000/${photo}`}
                                  alt={`Shipment photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105"
                                  onClick={() => window.open(`http://localhost:5000/${photo}`, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                                  <Eye className="text-white opacity-0 group-hover:opacity-100" size={16} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      {bid.shipment?.documents && bid.shipment.documents.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                            <FileText className="text-blue-600" size={20} />
                            Shipment Documents ({bid.shipment.documents.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bid.shipment.documents.map((document, index) => (
                              <div key={index} className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
                                <div className="flex-shrink-0 mr-4">
                                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    <FileText className="w-6 h-6 text-red-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {document.split('/').pop()}
                                  </p>
                                  <p className="text-sm text-gray-500">Document</p>
                                </div>
                                <div className="flex-shrink-0">
                                  <button
                                    onClick={() => window.open(`http://localhost:5000/${document}`, '_blank')}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Eye size={14} />
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bid ID and Actions */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            <span className="font-mono text-xs text-gray-400">Bid ID: {bid._id.slice(-8)}</span>
                          </div>
                          <div className="flex gap-3">
                            {bid.status === 'accepted' && bid.conversationId && (
                              <button
                                onClick={() => navigate(`/logistics/chat/${bid.conversationId}`)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                              >
                                <MessageSquare size={16} />
                                View Chat
                              </button>
                            )}
                            {bid.status === 'pending' && (
                              <div className="flex flex-col gap-3">
                                {/* Price Update Request Indicator */}
                                {bid.priceUpdateRequest && bid.priceUpdateRequest.status === 'pending' && (
                                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertCircle className="text-orange-600 dark:text-orange-400" size={16} />
                                      <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                                        Price Update Request
                                      </span>
                                    </div>
                                    <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                                      Shipper prefers: {getCurrencySymbol(bid.priceUpdateRequest.requestedCurrency || bid.currency)}{bid.priceUpdateRequest.requestedPrice?.toLocaleString()}
                                    </p>
                                    <button
                                      onClick={() => handlePriceUpdateRequest(bid)}
                                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                                    >
                                      <MessageSquare size={14} />
                                      Respond
                                    </button>
                                  </div>
                                )}
                                
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleEditBidClick(bid)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                  >
                                    <DollarSign size={16} />
                                    Edit Bid
                                  </button>
                                  <button
                                    onClick={() => handleCancelBid(bid._id, bid.shipment?.shipmentTitle)}
                                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                                  >
                                    <XCircle size={16} />
                                    Cancel Bid
                                  </button>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => navigate('/logistics/available-shipments')}
                              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              Browse More
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
                      <DollarSign className="text-white text-2xl" />
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
                      <div className="font-semibold text-gray-800">{editingBid?.shipment?.shipmentTitle}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Route</div>
                      <div className="font-semibold text-gray-800">{editingBid?.shipment?.routeSummary}</div>
                    </div>
                  </div>
                </div>

                {/* Edit Bid Form */}
                <form onSubmit={handleEditBidSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="editBidPrice">
                        <DollarSign className="text-green-600" size={16} />
                        Your Bid Price ({getCurrencySymbol(editBidCurrency)})
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-lg font-semibold">
                            {getCurrencySymbol(editBidCurrency)}
                          </span>
                        </div>
                        <input
                          type="number"
                          id="editBidPrice"
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                          value={editBidPrice}
                          onChange={(e) => setEditBidPrice(e.target.value)}
                          placeholder="Enter your bid amount"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3 flex items-center gap-2" htmlFor="editBidCurrency">
                        <Globe className="text-purple-600" size={16} />
                        Currency
                      </label>
                      <select
                        id="editBidCurrency"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                        value={editBidCurrency}
                        onChange={(e) => setEditBidCurrency(e.target.value)}
                        required
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="BRL">BRL - Brazilian Real</option>
                        <option value="MXN">MXN - Mexican Peso</option>
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="NGN">NGN - Nigerian Naira</option>
                      </select>
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
                        value={editBidEta}
                        onChange={(e) => setEditBidEta(e.target.value)}
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
                      value={editBidMessage}
                      onChange={(e) => setEditBidMessage(e.target.value)}
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
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <DollarSign size={16} />
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

      {/* Price Response Modal */}
      {showPriceResponseModal && respondingToBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Respond to Price Update Request
                </h3>
                <button
                  onClick={() => setShowPriceResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Price Update Request Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Shipment:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {respondingToBid.shipment?.shipmentTitle || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Current Price:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getCurrencySymbol(respondingToBid.currency || 'USD')}{respondingToBid.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Requested Price:</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {getCurrencySymbol(respondingToBid.priceUpdateRequest?.requestedCurrency || respondingToBid.currency || 'USD')}{respondingToBid.priceUpdateRequest?.requestedPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Response
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="priceResponse"
                          value="accepted"
                          checked={priceResponse === 'accepted'}
                          onChange={(e) => setPriceResponse(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Accept the requested price</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="priceResponse"
                          value="rejected"
                          checked={priceResponse === 'rejected'}
                          onChange={(e) => setPriceResponse(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Reject and keep current price</span>
                      </label>
                    </div>
                  </div>

                  {priceResponse === 'accepted' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Price ({respondingToBid.currency || 'USD'})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {getCurrencySymbol(respondingToBid.currency || 'USD')}
                        </span>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="Enter new price"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Add a message to the shipper..."
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows="3"
                      maxLength="500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePriceResponseSubmit}
                  disabled={priceResponseLoading || !priceResponse || (priceResponse === 'accepted' && !newPrice)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {priceResponseLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Sending Response...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} />
                      Send Response
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                The shipper will be notified of your response.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBids;

