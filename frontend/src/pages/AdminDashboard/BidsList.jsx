import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBids } from "../../redux/slices/adminSlice";
import { 
  DollarSign, Package, User, CheckCircle, XCircle, Calendar, Search, Filter, SortAsc, 
  Eye, AlertCircle, Clock, RefreshCw, ArrowLeft, ArrowRight, Award, Star, Globe, 
  FileText, Users, TrendingUp, Activity, Weight, Ruler, Navigation, Shield, 
  Building2, Mail, Phone, ExternalLink, MoreVertical, Edit, Trash2, UserCheck, 
  UserX, AlertTriangle, Truck, MapPin, Timer, Target, Zap, HandHeart
} from "lucide-react";

const BidsList = () => {
  const dispatch = useDispatch();
  const { allBids, loading, error } = useSelector((state) => state.admin);
  
  // Debug logging
  console.log("DEBUG: BidsList - allBids:", allBids);
  console.log("DEBUG: BidsList - loading:", loading);
  console.log("DEBUG: BidsList - error:", error);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    console.log("DEBUG: BidsList - Dispatching fetchAllBids");
    dispatch(fetchAllBids());
  }, [dispatch]);

  // Filter and sort bids
  const filteredBids = allBids.filter(bid => {
    const matchesSearch = (bid.shipment?.shipmentTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bid.carrier?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bid.carrier?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bid.carrier?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.amount?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || bid.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case 'status':
        aValue = (a.status || '').toLowerCase();
        bValue = (b.status || '').toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      case 'carrier':
        aValue = (a.carrier?.name || '').toLowerCase();
        bValue = (b.carrier?.name || '').toLowerCase();
        break;
      case 'shipment':
        aValue = (a.shipment?.shipmentTitle || '').toLowerCase();
        bValue = (b.shipment?.shipmentTitle || '').toLowerCase();
        break;
      default:
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredBids.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBids = filteredBids.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusCount = (status) => {
    return allBids.filter(bid => bid.status === status).length;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getTotalBidValue = () => {
    return allBids.reduce((total, bid) => total + (bid.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <DollarSign className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Bids</h3>
          <p className="text-gray-500">Please wait while we fetch all bids...</p>
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Bids</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => dispatch(fetchAllBids())}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium"
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
            <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800/20 rounded-2xl flex items-center justify-center">
                    <DollarSign className="text-white text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">All Bids</h1>
                    <p className="text-green-100 text-lg">Monitor and manage all platform bids</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white">{allBids.length}</div>
                  <div className="text-green-100 text-sm">Total Bids</div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search bids..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="relative">
                  <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="amount-desc">Highest Amount</option>
                    <option value="amount-asc">Lowest Amount</option>
                    <option value="status-asc">Status A-Z</option>
                    <option value="status-desc">Status Z-A</option>
                    <option value="carrier-asc">Carrier A-Z</option>
                    <option value="carrier-desc">Carrier Z-A</option>
                    <option value="shipment-asc">Shipment A-Z</option>
                    <option value="shipment-desc">Shipment Z-A</option>
                  </select>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</div>
                      <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{getStatusCount('accepted')}</div>
                      <div className="text-sm text-green-600">Accepted</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="text-red-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{getStatusCount('rejected')}</div>
                      <div className="text-sm text-red-600">Rejected</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalBidValue())}</div>
                      <div className="text-sm text-blue-600">Total Value</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bids Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign size={20} />
              Bids List ({filteredBids.length} found)
            </h2>
          </div>
          
          <div className="p-6">
            {filteredBids.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="text-green-400 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {searchTerm || filterStatus !== 'all' ? 'No Matching Bids' : 'No Bids Found'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search criteria to find bids.'
                    : 'No bids have been placed on the platform yet.'
                  }
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBids.map((bid) => (
                  <div key={bid._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold">
                            <DollarSign size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                              {formatCurrency(bid.amount)}
                            </h3>
                            <p className="text-sm text-gray-500">Bid ID: {bid._id.slice(-8)}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(bid.status)}`}>
                          {getStatusIcon(bid.status)}
                          {bid.status}
                        </div>
                      </div>

                      {/* Shipment Information */}
                      {bid.shipment && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="text-blue-500" size={16} />
                            <span className="font-medium text-gray-900">Shipment</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{bid.shipment.shipmentTitle || 'Untitled Shipment'}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bid.shipment.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                              bid.shipment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              bid.shipment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800 dark:text-gray-200'
                            }`}>
                              {bid.shipment.status}
                            </span>
                          </div>
                        </div>
                      )}


                      {/* Carrier Information */}
                      {bid.carrier && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="text-blue-500" size={16} />
                            <span className="font-medium text-gray-900">Carrier</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{bid.carrier.name || 'Unknown Carrier'}</p>
                          <p className="text-xs text-gray-500">{bid.carrier.email}</p>
                          {bid.carrier.companyName && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Building2 size={12} />
                              {bid.carrier.companyName}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {bid.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => alert('Accept Bid: ' + bid._id)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Accept
                            </button>
                            <button 
                              onClick={() => alert('Reject Bid: ' + bid._id)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => alert('View Bid Details: ' + bid._id)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBids.length)} of {filteredBids.length} bids
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidsList;