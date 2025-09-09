import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchMyBids } from "../../redux/slices/bidSlice";
import { getSocket } from '../../services/socket';
import { toast } from 'react-toastify';
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

  const toggleExpanded = (bidId) => {
    const newExpanded = new Set(expandedBids);
    if (newExpanded.has(bidId)) {
      newExpanded.delete(bidId);
    } else {
      newExpanded.add(bidId);
    }
    setExpandedBids(newExpanded);
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

    return () => {
      socket.off('bid-updated');
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
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/logistics/dashboard")}
                  className="w-12 h-12 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white dark:bg-gray-800/30 transition-all duration-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-16 h-16 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <DollarSign className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Bids</h1>
                  <p className="text-indigo-100 text-lg">Track and manage your submitted bids</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <span className="text-white font-semibold text-lg">
                    {myBids.length} bids
                  </span>
                </div>
                <button
                  onClick={() => dispatch(fetchMyBids())}
                  className="px-4 py-2 bg-white dark:bg-gray-800/20 backdrop-blur-sm text-white rounded-xl hover:bg-white dark:bg-gray-800/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                >
                  <RefreshCw size={16} />
                  Refresh
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
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">${bid.price.toFixed(2)}</div>
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
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="text-purple-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Pickup Date</div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              N/A
                            </div>
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
                            <div className="font-semibold text-gray-800 dark:text-gray-200 text-lg">${bid.price.toFixed(2)}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Estimated Time</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{bid.eta}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Pickup Date</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              N/A
                            </div>
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
      </div>
    </div>
  );
};

export default MyBids;

