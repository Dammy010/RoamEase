import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDisputes, resolveDispute } from "../../redux/slices/adminSlice";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MessageSquare,
  Search,
  SortAsc,
  Eye,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Gavel
} from "lucide-react";

const ReportsDisputes = () => {
  const dispatch = useDispatch();
  const { disputes, loading, error } = useSelector((state) => state.admin);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [expandedDisputes, setExpandedDisputes] = useState(new Set());

  useEffect(() => {
    dispatch(fetchAllDisputes());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_review':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'open':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'open':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const toggleExpanded = (disputeId) => {
    const newExpanded = new Set(expandedDisputes);
    if (newExpanded.has(disputeId)) {
      newExpanded.delete(disputeId);
    } else {
      newExpanded.add(disputeId);
    }
    setExpandedDisputes(newExpanded);
  };

  const handleResolve = (dispute) => {
    setSelectedDispute(dispute);
    setShowResolveModal(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedDispute) return;
    
    await dispatch(resolveDispute({
      disputeId: selectedDispute._id,
      status: 'resolved',
      adminNotes,
      resolution
    }));
    
    setShowResolveModal(false);
    setAdminNotes("");
    setResolution("");
    setSelectedDispute(null);
  };

  const handleMarkInReview = async (dispute) => {
    await dispatch(resolveDispute({
      disputeId: dispute._id,
      status: 'in_review',
      adminNotes: 'Marked for review by admin'
    }));
  };

  // Filter and sort disputes
  const filteredDisputes = disputes
    .filter(dispute => {
      const matchesSearch = 
        dispute.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.against?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.shipment?.reference?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || dispute.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "reporter":
          aValue = a.reporter?.name || "";
          bValue = b.reporter?.name || "";
          break;
        default:
          return 0;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDisputes = filteredDisputes.slice(startIndex, startIndex + itemsPerPage);

  const statusCounts = {
    all: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    in_review: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading disputes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Disputes</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Reports & Disputes
                </h1>
                <p className="text-gray-500">
                  {disputes.length} dispute{disputes.length !== 1 ? 's' : ''} • Admin Panel
                </p>
              </div>
          </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(fetchAllDisputes())}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh disputes"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'all', label: 'Total Disputes', count: statusCounts.all, color: 'blue', icon: AlertTriangle },
            { key: 'open', label: 'Open', count: statusCounts.open, color: 'orange', icon: AlertCircle },
            { key: 'in_review', label: 'In Review', count: statusCounts.in_review, color: 'yellow', icon: Clock },
            { key: 'resolved', label: 'Resolved', count: statusCounts.resolved, color: 'green', icon: CheckCircle }
          ].map(({ key, label, count, color, icon: IconComponent }) => (
            <div
              key={key}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 cursor-pointer transition-all duration-200 hover:shadow-xl ${
                filterStatus === key ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setFilterStatus(key)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search disputes by description, reporter, or shipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            <option value="createdAt">Date Created</option>
            <option value="status">Status</option>
            <option value="reporter">Reporter</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm flex items-center space-x-2"
          >
            <SortAsc className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredDisputes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gavel className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Disputes Found</h3>
            <p className="text-gray-500">
              {searchQuery || filterStatus !== 'all' 
                ? 'No disputes match your search criteria.' 
                : 'There are no disputes to display at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedDisputes.map((dispute) => (
              <div
                key={dispute._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-200"
              >
                {/* Dispute Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {getStatusIcon(dispute.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                          Dispute #{dispute._id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-500">
                          Reported by {dispute.reporter?.name || 'Unknown User'} • {formatTimeAgo(dispute.createdAt)}
                          </p>
                        </div>
                      </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                      
                      <button
                        onClick={() => toggleExpanded(dispute._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedDisputes.has(dispute._id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                    </div>

                {/* Dispute Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                      <h4 className="font-medium text-gray-800 mb-2">Reporter Details</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Name:</span> {dispute.reporter?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {dispute.reporter?.email || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {dispute.reporter?.role || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                      <div>
                      <h4 className="font-medium text-gray-800 mb-2">Against</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Name:</span> {dispute.against?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {dispute.against?.email || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {dispute.against?.role || 'N/A'}
                        </p>
                      </div>
                      </div>
                    </div>

                    <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Shipment Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reference:</span> {dispute.shipment?.reference || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> {dispute.shipment?.status || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Route:</span> {dispute.shipment?.origin || 'N/A'} → {dispute.shipment?.destination || 'N/A'}
                      </p>
                    </div>
                    </div>

                      <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {dispute.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Expanded Details */}
                  {expandedDisputes.has(dispute._id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Admin Notes</h4>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                            {dispute.adminNotes || 'No admin notes yet.'}
                          </p>
                            </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Resolution</h4>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                            {dispute.resolution || 'No resolution yet.'}
                          </p>
                        </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    {dispute.status === 'open' && (
                      <>
                        <button
                          onClick={() => handleMarkInReview(dispute)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Mark for Review
                        </button>
                        <button
                          onClick={() => handleResolve(dispute)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                      </>
                    )}

                    {dispute.status === 'in_review' && (
                        <button
                        onClick={() => handleResolve(dispute)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                        Resolve
                        </button>
                    )}
                    
                        <button
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowDetailsModal(true);
                      }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                      <Eye className="w-4 h-4" />
                          View Details
                        </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDisputes.length)} of {filteredDisputes.length} disputes
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Resolve Dispute</h3>
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin notes..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter resolution details..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDisputes;