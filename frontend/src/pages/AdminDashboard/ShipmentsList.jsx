import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCurrency } from "../../contexts/CurrencyContext";
import { fetchAllShipments } from "../../redux/slices/adminSlice";
import { 
  Package, MapPin, Truck, Calendar, UserCircle, Search, Filter, SortAsc, 
  Eye, AlertCircle, CheckCircle, Clock, RefreshCw, ArrowLeft, ArrowRight,
  Award, Star, Globe, FileText, Users, TrendingUp, Activity, Wallet,
  Weight, Ruler, Navigation, Shield, Building2, Mail, Phone, ExternalLink,
  MoreVertical, Edit, Trash2, UserCheck, UserX, AlertTriangle
} from "lucide-react";

const ShipmentsList = () => {
  const dispatch = useDispatch();
  const { formatCurrency } = useCurrency();
  const { allShipments, loading, error } = useSelector((state) => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    dispatch(fetchAllShipments());
  }, [dispatch]);

  // Filter and sort shipments
  const filteredShipments = allShipments.filter(shipment => {
    const matchesSearch = (shipment.shipmentTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (shipment.pickupAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (shipment.deliveryAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (shipment.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (shipment.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'shipmentTitle':
        aValue = (a.shipmentTitle || '').toLowerCase();
        bValue = (b.shipmentTitle || '').toLowerCase();
        break;
      case 'status':
        aValue = (a.status || '').toLowerCase();
        bValue = (b.status || '').toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      case 'user':
        aValue = (a.user?.name || '').toLowerCase();
        bValue = (b.user?.name || '').toLowerCase();
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
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Package className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <Award className="w-4 h-4" />;
      case 'delivered':
        return <Truck className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusCount = (status) => {
    return allShipments.filter(shipment => shipment.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="text-purple-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Shipments</h3>
          <p className="text-gray-500">Please wait while we fetch all shipments...</p>
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Shipments</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => dispatch(fetchAllShipments())}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium"
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">All Shipments</h1>
                    <p className="text-indigo-100 mt-1">Monitor and manage all platform shipments</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{allShipments.length}</div>
                  <div className="text-indigo-100 text-sm">Total Shipments</div>
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
                    placeholder="Search shipments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="shipmentTitle-asc">Title A-Z</option>
                    <option value="shipmentTitle-desc">Title Z-A</option>
                    <option value="status-asc">Status A-Z</option>
                    <option value="status-desc">Status Z-A</option>
                    <option value="user-asc">User A-Z</option>
                    <option value="user-desc">User Z-A</option>
                  </select>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{getStatusCount('open')}</div>
                      <div className="text-sm text-blue-600">Open</div>
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
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{getStatusCount('completed')}</div>
                      <div className="text-sm text-purple-600">Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Truck className="text-emerald-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{getStatusCount('delivered')}</div>
                      <div className="text-sm text-emerald-600">Delivered</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">{getStatusCount('delivered')}</div>
                      <div className="text-sm text-indigo-600">Delivered</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="text-red-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{getStatusCount('cancelled')}</div>
                      <div className="text-sm text-red-600">Cancelled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={20} />
              Shipments List ({filteredShipments.length} found)
            </h2>
          </div>
          
          <div className="p-6">
            {filteredShipments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="text-blue-400 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {searchTerm || filterStatus !== 'all' ? 'No Matching Shipments' : 'No Shipments Found'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search criteria to find shipments.'
                    : 'No shipments have been created on the platform yet.'
                  }
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedShipments.map((shipment) => (
                  <div key={shipment._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold">
                            <Package size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                              {shipment.shipmentTitle || 'Untitled Shipment'}
                            </h3>
                            <p className="text-sm text-gray-500">ID: {shipment._id.slice(-8)}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(shipment.status)}`}>
                          {getStatusIcon(shipment.status)}
                          {shipment.status}
                        </div>
                      </div>

                      {/* Route Information */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="text-green-500 mt-1" size={16} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Pickup</p>
                            <p className="text-sm text-gray-600">{shipment.pickupAddress || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="text-red-500 mt-1" size={16} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Delivery</p>
                            <p className="text-sm text-gray-600">{shipment.deliveryAddress || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 mb-4">
                        {shipment.preferredPickupDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span className="font-medium">Pickup:</span>
                            <span>{new Date(shipment.preferredPickupDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {shipment.preferredDeliveryDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span className="font-medium">Delivery:</span>
                            <span>{new Date(shipment.preferredDeliveryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* User Information */}
                      {shipment.user && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                          <UserCircle size={16} />
                          <div>
                            <p className="font-medium">{shipment.user.name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500">{shipment.user.email}</p>
                          </div>
                        </div>
                      )}

                      {/* Additional Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        {shipment.weight && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Weight size={14} />
                            <span>{shipment.weight}kg</span>
                          </div>
                        )}
                        {shipment.budget && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Wallet size={14} />
                            <span>{formatCurrency(shipment.budget)}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={() => alert('View Shipment Details: ' + shipment._id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredShipments.length)} of {filteredShipments.length} shipments
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
                          ? 'bg-blue-600 text-white'
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

export default ShipmentsList;