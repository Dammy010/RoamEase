import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchShipmentHistory } from "../../redux/slices/shipmentSlice";
import { Package, MapPin, Calendar, Clock, ArrowRight, Eye, Truck, CheckCircle, RefreshCw, Filter, Search } from "lucide-react";

const ShipmentHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { history, loading, error } = useSelector((state) => state.shipment);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    dispatch(fetchShipmentHistory());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'delivered':
        return <Package className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const filteredAndSortedHistory = history
    ?.filter(shipment => {
      const matchesSearch = shipment.shipmentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shipment.pickupCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shipment.deliveryCity?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "oldest":
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case "title":
          return a.shipmentTitle?.localeCompare(b.shipmentTitle);
        default:
          return 0;
      }
    }) || [];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <ArrowRight className="rotate-180 text-white" size={20} />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Shipment History</h1>
                  <p className="text-indigo-100 text-lg">Track all your completed deliveries and shipments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <span className="text-white font-semibold text-lg">
                    {history?.length || 0} shipments
                  </span>
                </div>
                <button
                  onClick={() => dispatch(fetchShipmentHistory())}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                >
                  <RefreshCw size={16} className="text-white" />
                  <span className="text-white font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search shipments by title, pickup, or delivery city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading shipment history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading History</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => dispatch(fetchShipmentHistory())}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredAndSortedHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">No Shipment History Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== "all" 
                  ? "No shipments match your current filters. Try adjusting your search criteria."
                  : "You haven't completed any shipments yet. Start by posting your first shipment!"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => navigate('/user/post-shipment')}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
                >
                  Post Your First Shipment
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedHistory.map((shipment, index) => (
                <div
                  key={shipment._id}
                  className="group p-6 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          📦
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                          {shipment.shipmentTitle}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="text-gray-400" size={16} />
                          <span className="text-gray-600 font-medium">
                            {shipment.pickupCity}, {shipment.pickupCountry}
                          </span>
                          <ArrowRight className="text-gray-400" size={16} />
                          <span className="text-gray-600 font-medium">
                            {shipment.deliveryCity}, {shipment.deliveryCountry}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <Calendar className="text-indigo-500" size={14} />
                            <span className="font-medium">Pickup:</span>
                            {new Date(shipment.preferredPickupDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="text-green-500" size={14} />
                            <span className="font-medium">Delivery:</span>
                            {new Date(shipment.preferredDeliveryDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="text-gray-400" size={14} />
                            <span className="font-medium">Updated:</span>
                            {new Date(shipment.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border flex items-center gap-2 ${getStatusColor(shipment.status)}`}>
                        {getStatusIcon(shipment.status)}
                        {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                      </div>
                      <button
                        onClick={() => navigate(`/user/my-shipments/${shipment._id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
      </div>
    </div>
  );
};

export default ShipmentHistory;
