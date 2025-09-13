import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markShipmentAsDeliveredByUser } from '../../redux/slices/shipmentSlice';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { 
  Package, MapPin, Calendar, Clock, Truck, User, Phone, Mail, 
  CheckCircle, AlertCircle, Star, Award, Shield, Zap, 
  RefreshCw, Search, Filter, SortAsc, Eye, MoreVertical,
  ArrowLeft, Globe, FileText, Image, TrendingUp, Building2
} from 'lucide-react';

const DeliveredShipments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [deliveredShipments, setDeliveredShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shipmentToConfirm, setShipmentToConfirm] = useState(null);

  // Fetch delivered shipments that need user confirmation
  useEffect(() => {
    const fetchDeliveredShipments = async () => {
      setLoading(true);
      try {
        console.log('🔍 DeliveredShipments - Starting API call to /shipments/delivered');
        console.log('🔍 DeliveredShipments - User:', user);
        
        const response = await api.get('/shipments/delivered');
        console.log('🔍 DeliveredShipments - API Response:', response.data);
        console.log('🔍 DeliveredShipments - Delivered shipments:', response.data.shipments);
        
        // The API already returns only delivered shipments awaiting confirmation
        const delivered = response.data.shipments || [];
        
        console.log('🔍 DeliveredShipments - Number of delivered shipments:', delivered.length);
        setDeliveredShipments(delivered);
      } catch (error) {
        console.error('Error fetching delivered shipments:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error(`Failed to fetch delivered shipments: ${error.response?.data?.message || error.message}`);
        setDeliveredShipments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveredShipments();

    // Socket event listeners for real-time updates
    const socket = getSocket();
    
    // Listen for shipment delivered events
    socket.on('shipment-delivered-by-logistics', (shipment) => {
      if (shipment.user._id === user._id) {
        toast.info(`🚚 Your shipment "${shipment.shipmentTitle}" has been delivered! Please confirm receipt.`);
        // Refresh the delivered shipments list
        fetchDeliveredShipments();
      }
    });

    // Listen for user-specific delivery notifications
    socket.on(`user-${user._id}`, (data) => {
      if (data.type === 'shipment-delivered') {
        toast.info(data.message);
        // Refresh the delivered shipments list
        fetchDeliveredShipments();
      }
    });

    return () => {
      socket.off('shipment-delivered-by-logistics');
      socket.off(`user-${user._id}`);
    };
  }, [user]);

  const handleMarkAsDelivered = (shipment) => {
    setShipmentToConfirm(shipment);
    setShowConfirmModal(true);
  };

  const confirmDelivery = async () => {
    if (!shipmentToConfirm) return;
    
    try {
      const result = await dispatch(markShipmentAsDeliveredByUser(shipmentToConfirm._id));
      
      if (markShipmentAsDeliveredByUser.fulfilled.match(result)) {
        toast.success('Delivery confirmed successfully! You can now rate the delivery service.');
        
        // Update local state
        setDeliveredShipments(prev => 
          prev.filter(shipment => shipment._id !== shipmentToConfirm._id)
        );
      } else {
        const errorMessage = result.payload || 'Failed to confirm delivery';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Error confirming delivery');
      console.error('Error:', error);
    } finally {
      setShowConfirmModal(false);
      setShipmentToConfirm(null);
    }
  };

  const cancelDelivery = () => {
    setShowConfirmModal(false);
    setShipmentToConfirm(null);
  };

  // Filter and sort shipments
  const filteredAndSortedShipments = deliveredShipments
    .filter(shipment => 
      !searchTerm || 
      shipment.shipmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.pickupCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.deliveryCity.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.deliveredAt || b.createdAt) - new Date(a.deliveredAt || a.createdAt);
        case 'oldest':
          return new Date(a.deliveredAt || a.createdAt) - new Date(b.deliveredAt || b.createdAt);
        case 'title':
          return a.shipmentTitle.localeCompare(b.shipmentTitle);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Deliveries</h3>
          <p className="text-gray-500">Please wait while we fetch your delivered shipments...</p>
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
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Delivered Shipments</h1>
                  <p className="text-indigo-100">Confirm receipt of your delivered shipments</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">{deliveredShipments.length}</div>
                  <div className="text-sm text-gray-600">Awaiting Confirmation</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {deliveredShipments.filter(s => s.deliveredAt).length}
                  </div>
                  <div className="text-sm text-gray-600">Recently Delivered</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                  <div className="text-2xl font-bold text-pink-600 mb-1">
                    {deliveredShipments.filter(s => s.deliveredByLogistics).length}
                  </div>
                  <div className="text-sm text-gray-600">With Logistics Info</div>
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

        {/* Shipments List */}
        {filteredAndSortedShipments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="text-indigo-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {searchTerm ? 'No Matching Deliveries' : 'No Deliveries to Confirm'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search criteria to find delivered shipments.'
                  : 'You don\'t have any delivered shipments waiting for confirmation.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedShipments.map((shipment) => (
              <div
                key={shipment._id}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                        <Truck className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{shipment.shipmentTitle}</h3>
                        <p className="text-indigo-100 flex items-center gap-2">
                          <MapPin size={16} />
                          {shipment.pickupCity} → {shipment.deliveryCity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl border border-white/20">
                      <CheckCircle className="text-white" size={20} />
                      <span className="text-white font-medium">Delivered</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Side - Shipment Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="text-blue-500" size={16} />
                            <span className="text-sm font-medium text-gray-600">Delivered Date</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="text-purple-500" size={16} />
                            <span className="text-sm font-medium text-gray-600">Time</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleTimeString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Logistics Information */}
                      {shipment.deliveredByLogistics && (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Building2 className="text-indigo-500" size={16} />
                            <span className="font-medium text-gray-800 dark:text-gray-200">Logistics Company</span>
                          </div>
                          <div className="space-y-2">
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {shipment.deliveredByLogistics.companyName || shipment.deliveredByLogistics.name || 'N/A'}
                            </div>
                            {shipment.deliveredByLogistics.email && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Mail size={14} />
                                {shipment.deliveredByLogistics.email}
                              </div>
                            )}
                            {shipment.deliveredByLogistics.phone && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Phone size={14} />
                                {shipment.deliveredByLogistics.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delivery Notice */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-blue-500 mt-0.5" size={16} />
                          <div>
                            <div className="font-medium text-blue-800 mb-1">Delivery Notice</div>
                            <p className="text-sm text-blue-700">
                              Your shipment has been delivered by the logistics company. 
                              Please confirm receipt to complete the delivery process and unlock rating options.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Ready to Confirm</div>
                        <div className="text-gray-600">Your shipment is waiting for confirmation</div>
                      </div>

                      <button
                        onClick={() => handleMarkAsDelivered(shipment)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                      >
                        <CheckCircle size={20} />
                        Confirm Delivery
                      </button>

                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-2">
                          After confirming, you can rate the delivery service
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="text-gray-300" size={16} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirm Delivery</h3>
                  <p className="text-indigo-100 text-sm">Are you sure you want to confirm this delivery?</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600 text-3xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Confirm Receipt of Shipment
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  This will confirm that you have received the shipment "{shipmentToConfirm?.shipmentTitle}" and complete the delivery process.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-500 mt-0.5" size={16} />
                    <div className="text-left">
                      <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Important</div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        After confirming, you can rate the delivery service and provide feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelivery}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelivery}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveredShipments;