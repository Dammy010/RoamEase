import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchLogisticsHistory } from '../../redux/slices/logisticsSlice';
import { FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaUser, FaBox } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LogisticsHistory = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { history, historyLoading, historyError } = useSelector((state) => state.logistics);
  const [expandedShipments, setExpandedShipments] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(fetchLogisticsHistory());
  }, [dispatch]);

  const toggleExpanded = (shipmentId) => {
    const newExpanded = new Set(expandedShipments);
    if (newExpanded.has(shipmentId)) {
      newExpanded.delete(shipmentId);
    } else {
      newExpanded.add(shipmentId);
    }
    setExpandedShipments(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" size={16} />;
      case 'delivered':
        return <FaTruck className="text-orange-500" size={16} />;
      case 'received':
        return <FaBox className="text-blue-500" size={16} />;
      default:
        return <FaClock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const filteredAndSortedHistory = history
    .filter(shipment => {
      if (filterStatus === 'all') return true;
      return shipment.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'oldest':
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case 'price-high':
          return (b.bid?.price || 0) - (a.bid?.price || 0);
        case 'price-low':
          return (a.bid?.price || 0) - (b.bid?.price || 0);
        default:
          return 0;
      }
    });

  if (historyLoading) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your delivery history...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading History</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{historyError}</p>
              <button
                onClick={() => dispatch(fetchLogisticsHistory())}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-3">
                <FaTruck className="text-blue-600" />
                Delivery History
              </h1>
              <p className="text-gray-600 text-lg">
                Track all your completed deliveries and shipments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-800 font-semibold">
                  {filteredAndSortedHistory.length} Total Deliveries
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="received">Received</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={() => dispatch(fetchLogisticsHistory())}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaClock size={14} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        {filteredAndSortedHistory.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
            <div className="text-center">
              <FaTruck className="text-gray-400 text-8xl mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Delivery History Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't completed any deliveries yet. Start by browsing available shipments!
              </p>
              <button
                onClick={() => window.location.href = '/logistics/available-shipments'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Available Shipments
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedHistory.map((shipment) => {
              const isExpanded = expandedShipments.has(shipment._id);
              
              return (
                <div
                  key={shipment._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Shipment Header */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Side - Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                            📦
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                              {shipment.shipmentTitle}
                            </h3>
                            <p className="text-gray-600 font-medium mb-2">
                              {shipment.pickupCity}, {shipment.pickupCountry} → {shipment.deliveryCity}, {shipment.deliveryCountry}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FaUser size={12} />
                                {shipment.user?.companyName || shipment.user?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt size={12} />
                                {new Date(shipment.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Status and Actions */}
                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(shipment.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(shipment.status)}`}>
                            {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                          </span>
                        </div>
                        
                        {shipment.bid && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                              <FaDollarSign size={16} />
                              {shipment.bid.price}
                            </div>
                            <p className="text-sm text-gray-500">Your Bid Amount</p>
                          </div>
                        )}

                        <button
                          onClick={() => toggleExpanded(shipment._id)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <FaEye size={14} />
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Shipment Details */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <FaBox size={16} />
                            Shipment Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <span className="font-medium text-gray-700">Type of Goods:</span>
                              <p className="text-gray-600">{shipment.typeOfGoods}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Weight:</span>
                              <p className="text-gray-600">{shipment.weight || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Description:</span>
                              <p className="text-gray-600">{shipment.descriptionOfGoods}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Mode of Transport:</span>
                              <p className="text-gray-600">{shipment.modeOfTransport}</p>
                            </div>
                          </div>
                        </div>

                        {/* Bid Details */}
                        {shipment.bid && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <FaDollarSign size={16} />
                              Your Bid Details
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <span className="font-medium text-gray-700">Bid Amount:</span>
                                <p className="text-green-600 font-semibold text-lg">${shipment.bid.price}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Estimated Delivery:</span>
                                <p className="text-gray-600">{shipment.bid.eta || 'Not specified'}</p>
                              </div>
                              {shipment.bid.message && (
                                <div>
                                  <span className="font-medium text-gray-700">Message:</span>
                                  <p className="text-gray-600">{shipment.bid.message}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contact Information */}
                        <div className="lg:col-span-2">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <FaUser size={16} />
                            Shipper Contact
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-gray-700">Company:</span>
                              <p className="text-gray-600">{shipment.user?.companyName || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Contact Person:</span>
                              <p className="text-gray-600">{shipment.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Email:</span>
                              <p className="text-gray-600">{shipment.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Phone:</span>
                              <p className="text-gray-600">{shipment.user?.phoneNumber || 'N/A'}</p>
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
        )}
      </div>
    </div>
  );
};

export default LogisticsHistory;
