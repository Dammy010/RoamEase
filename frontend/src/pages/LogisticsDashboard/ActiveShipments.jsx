import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { markShipmentAsDeliveredByLogistics } from '../../redux/slices/shipmentSlice';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  Truck, Package, MapPin, Calendar, Clock, User, Phone, 
  Eye, ChevronDown, ChevronUp, CheckCircle, AlertCircle, 
  Weight, Ruler, Shield, FileText, Image, RefreshCw,
  DollarSign, MessageSquare, Globe, ArrowRight
} from 'lucide-react';

const ActiveShipments = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [activeShipments, setActiveShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedShipments, setExpandedShipments] = useState(new Set());

  const toggleExpanded = (shipmentId) => {
    const newExpanded = new Set(expandedShipments);
    if (newExpanded.has(shipmentId)) {
      newExpanded.delete(shipmentId);
    } else {
      newExpanded.add(shipmentId);
    }
    setExpandedShipments(newExpanded);
  };

  // Fetch active shipments (accepted bids) for this logistics company
  useEffect(() => {
    const fetchActiveShipments = async () => {
      setLoading(true);
      
      // Debug: Check user authentication status
      console.log('=== ACTIVE SHIPMENTS DEBUG ===');
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      console.log('User ID:', user?._id);
      console.log('Is user logged in:', !!user);
      
      // Check localStorage for token
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? 'Present' : 'Missing');
      
      // Check if user is logistics
      if (!user || user.role !== 'logistics') {
        console.error('User is not a logistics company or not logged in');
        toast.error('You must be logged in as a logistics company to view active shipments');
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/shipments/my-active-shipments');
        console.log('API Response:', response.data);
        setActiveShipments(response.data.shipments || []);
      } catch (error) {
        console.error('Error fetching active shipments:', error);
        console.error('Error response:', error.response);
        
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          toast.info('No active shipments found. You need to have accepted bids to see active shipments.');
        } else {
          toast.error('Failed to fetch active shipments. Please try again.');
        }
        setActiveShipments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveShipments();
  }, [user]);

  const handleMarkAsDelivered = async (shipmentId) => {
    try {
      const result = await dispatch(markShipmentAsDeliveredByLogistics(shipmentId));
      
      if (markShipmentAsDeliveredByLogistics.fulfilled.match(result)) {
        toast.success('Shipment marked as delivered successfully!');
        
        // Update local state
        setActiveShipments(prev => 
          prev.map(shipment => 
            shipment._id === shipmentId 
              ? { ...shipment, status: 'delivered' }
              : shipment
          )
        );
      } else {
        const errorMessage = result.payload || 'Failed to mark shipment as delivered';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Error marking shipment as delivered');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Loading Active Shipments</h3>
              <p className="text-gray-600 dark:text-gray-400">Fetching your current deliveries...</p>
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
                <div className="w-12 h-12 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Truck className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Active Shipments</h1>
                  <p className="text-indigo-100 text-base">Manage your accepted bids and track deliveries</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold text-base">
                    {activeShipments.length} active
                  </span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                >
                  <RefreshCw size={16} className="text-white" />
                  <span className="text-white font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeShipments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="text-indigo-500 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">No Active Shipments</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You don't have any accepted bids or active shipments at the moment. 
                Start by browsing available shipments and placing bids!
              </p>
              <button
                onClick={() => window.location.href = '/logistics/available-shipments'}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Available Shipments
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeShipments.map((shipment, index) => (
              <div
                key={shipment._id}
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Compact Header View */}
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left Side - Shipment Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            🚚
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors duration-300">
                              {shipment.shipmentTitle}
                            </h3>
                            <button
                              onClick={() => toggleExpanded(shipment._id)}
                              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                              title={expandedShipments.has(shipment._id) ? "Hide details" : "Show details"}
                            >
                              {expandedShipments.has(shipment._id) ? (
                                <>
                                  <ChevronUp size={14} />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={14} />
                                  Details
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="text-gray-400" size={16} />
                            <span className="text-gray-600 font-medium text-lg">
                              {shipment.pickupCity} → {shipment.deliveryCity}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Shipment Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Status</div>
                            <div className={`text-sm font-semibold px-2 py-1 rounded-full text-xs ${
                              shipment.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                              shipment.status === 'completed' ? 'bg-yellow-100 text-yellow-800' :
                              shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800 dark:text-gray-200'
                            }`}>
                              {shipment.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="text-green-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Bid Price</div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">${shipment.acceptedBid?.price}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="text-purple-600" size={16} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">ETA</div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{shipment.acceptedBid?.eta}</div>
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
                              {shipment.user?.companyName || shipment.user?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="text-gray-400" size={16} />
                            <span className="text-gray-600">{shipment.user?.country}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col items-end gap-4">
                      {shipment.status === 'delivered' ? (
                        <div className="flex items-center gap-3 px-4 py-2 bg-green-100 text-green-800 rounded-xl border border-green-200">
                          <CheckCircle className="text-green-600" size={16} />
                          <span className="font-semibold text-sm">Delivered</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkAsDelivered(shipment._id)}
                          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Detailed View */}
                {expandedShipments.has(shipment._id) && (
                  <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="p-8">
                      {/* Key Information Summary */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                          <Truck className="text-indigo-600" size={20} />
                          Delivery Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Route</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.pickupCity} → {shipment.deliveryCity}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Delivery Date</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.formattedDeliveryDate}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100">
                            <div className="text-sm text-gray-600 mb-1">Transport Mode</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.modeOfTransport}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Goods & Transport */}
                        <div className="space-y-6">
                          {/* Goods Information */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <Package className="text-blue-600" size={20} />
                              Goods Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Package className="text-blue-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Type</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.typeOfGoods}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Ruler className="text-green-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Quantity</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.quantitySummary}</div>
                                </div>
                              </div>
                              {shipment.weight && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Weight className="text-purple-600" size={16} />
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 font-medium">Weight</div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.weightSummary}</div>
                                  </div>
                                </div>
                              )}
                              {shipment.dimensions && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Ruler className="text-orange-600" size={16} />
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 font-medium">Dimensions</div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.dimensions}</div>
                                  </div>
                                </div>
                              )}
                              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                <div className="text-sm text-gray-500 font-medium mb-1">Description</div>
                                <div className="text-sm text-gray-800 dark:text-gray-200">{shipment.descriptionOfGoods}</div>
                              </div>
                            </div>
                          </div>

                          {/* Transport Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <Truck className="text-indigo-600" size={20} />
                              Transport Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <Truck className="text-indigo-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Mode</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.modeOfTransport}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Shield className="text-blue-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Insurance</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.insuranceRequired}</div>
                                </div>
                              </div>
                              {shipment.handlingInstructions && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                  <div className="text-sm text-gray-500 font-medium mb-1">Handling Instructions</div>
                                  <div className="text-sm text-gray-800 dark:text-gray-200">{shipment.handlingInstructions}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Location Details */}
                        <div className="space-y-6">
                          {/* Pickup Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <MapPin className="text-orange-600" size={20} />
                              Pickup Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <MapPin className="text-orange-600" size={16} />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-500 font-medium">Address</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.pickupAddress}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">City</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.pickupCity}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Country</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.pickupCountry}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Contact Person</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.pickupContactPerson}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Phone</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.pickupPhoneNumber}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Details */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <MapPin className="text-green-600" size={20} />
                              Delivery Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <MapPin className="text-green-600" size={16} />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-500 font-medium">Address</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.deliveryAddress}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">City</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.deliveryCity}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Country</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.deliveryCountry}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="text-blue-600" size={16} />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Delivery Date</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.formattedDeliveryDate}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Contact Person</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.deliveryContactPerson}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500 font-medium">Phone</div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">{shipment.deliveryPhoneNumber}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photos Section */}
                      {shipment.photos && shipment.photos.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                            <Image className="text-pink-600" size={20} />
                            Photos ({shipment.photos.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {shipment.photos.map((photo, index) => (
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
                      {shipment.documents && shipment.documents.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                            <FileText className="text-blue-600" size={20} />
                            Documents ({shipment.documents.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shipment.documents.map((document, index) => (
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

                      {/* Shipment ID and Actions */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            <span className="font-mono text-xs text-gray-400">Shipment ID: {shipment._id.slice(-8)}</span>
                          </div>
                          <div className="flex gap-3">
                            {shipment.status === 'delivered' ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-xl border border-green-200">
                                <CheckCircle size={16} />
                                <span className="font-semibold text-sm">Delivered</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleMarkAsDelivered(shipment._id)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                              >
                                <CheckCircle size={16} />
                                Mark as Delivered
                              </button>
                            )}
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

export default ActiveShipments;