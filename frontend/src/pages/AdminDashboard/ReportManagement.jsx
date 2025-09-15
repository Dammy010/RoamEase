import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  User,
  Calendar,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Tag
} from 'lucide-react';
import { 
  getAllReports, 
  updateReport, 
  deleteReport, 
  getReportStats,
  clearReportError 
} from '../../redux/slices/reportSlice';
import ReportDetail from '../../components/reports/ReportDetail';

const ReportManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    allReports, 
    allReportsLoading, 
    allReportsError, 
    allReportsPagination,
    stats,
    statsLoading,
    updateLoading,
    deleteLoading
  } = useSelector((state) => state.reports);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    reporterRole: '',
    assignedTo: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStats, setShowStats] = useState(true);

  const categories = [
    { value: 'technical_issue', label: 'Technical Issue', color: 'bg-red-100 text-red-800' },
    { value: 'service_complaint', label: 'Service Complaint', color: 'bg-orange-100 text-orange-800' },
    { value: 'payment_issue', label: 'Payment Issue', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'delivery_problem', label: 'Delivery Problem', color: 'bg-purple-100 text-purple-800' },
    { value: 'communication_issue', label: 'Communication Issue', color: 'bg-blue-100 text-blue-800' },
    { value: 'account_issue', label: 'Account Issue', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'feature_request', label: 'Feature Request', color: 'bg-green-100 text-green-800' },
    { value: 'bug_report', label: 'Bug Report', color: 'bg-pink-100 text-pink-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  const statusConfig = {
    open: { label: 'Open', color: 'text-blue-600 bg-blue-100', icon: Clock },
    in_progress: { label: 'In Progress', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle },
    resolved: { label: 'Resolved', color: 'text-green-600 bg-green-100', icon: CheckCircle },
    closed: { label: 'Closed', color: 'text-gray-600 bg-gray-100', icon: XCircle },
    rejected: { label: 'Rejected', color: 'text-red-600 bg-red-100', icon: XCircle }
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'text-green-600' },
    medium: { label: 'Medium', color: 'text-yellow-600' },
    high: { label: 'High', color: 'text-orange-600' },
    urgent: { label: 'Urgent', color: 'text-red-600' }
  };

  useEffect(() => {
    // Only load admin data if user is admin
    if (user?.role === 'admin') {
      loadReports();
      loadStats();
    }
  }, [currentPage, filters, user?.role]);

  useEffect(() => {
    if (allReportsError) {
      toast.error(allReportsError);
      dispatch(clearReportError('allReports'));
    }
  }, [allReportsError, dispatch]);

  const loadReports = () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...filters
    };
    dispatch(getAllReports(params));
  };

  const loadStats = () => {
    dispatch(getReportStats());
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadReports();
  };

  const handleUpdateReport = async (reportId, updateData) => {
    try {
      await dispatch(updateReport({ reportId, updateData })).unwrap();
      toast.success('Report updated successfully');
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await dispatch(deleteReport(reportId)).unwrap();
        toast.success('Report deleted successfully');
        loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const getCategoryInfo = (category) => {
    return categories.find(cat => cat.value === category) || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || { label: 'Unknown', color: 'text-gray-600 bg-gray-100', icon: Clock };
  };

  const getPriorityInfo = (priority) => {
    return priorityConfig[priority] || { label: 'Medium', color: 'text-yellow-600' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgeInDays = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Admin access required.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Report Management
                    </h1>
                    <p className="text-indigo-100 mt-1">
                      Monitor, manage, and resolve all system reports and issues
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {showStats ? 'Hide' : 'Show'} Statistics
                  </button>
                  <button
                    onClick={loadStats}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {showStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.statusStats?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Open Reports</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.statusStats?.open || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting action</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.statusStats?.in_progress || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Being worked on</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.statusStats?.resolved || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Successfully closed</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search reports by title, description, or reporter..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Priorities</option>
                  {Object.entries(priorityConfig).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reporter Role
                </label>
                <select
                  value={filters.reporterRole}
                  onChange={(e) => handleFilterChange('reporterRole', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="logistics">Logistics</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Assigned To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment
                </label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Assignments</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {allReportsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading reports...</p>
              </div>
            </div>
          ) : allReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No reports found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters or check back later for new reports
              </p>
              <button
                onClick={() => {
                  setFilters({
                    status: '',
                    category: '',
                    priority: '',
                    reporterRole: '',
                    assignedTo: '',
                    search: ''
                  });
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Report Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {allReports.map((report) => {
                    const categoryInfo = getCategoryInfo(report.category);
                    const statusInfo = getStatusInfo(report.status);
                    const priorityInfo = getPriorityInfo(report.priority);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                {report.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                                {report.description}
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${categoryInfo.color}`}>
                                {categoryInfo.label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {report.reporter?.name || report.reporter?.companyName || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {report.reporterRole}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1.5" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                            report.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            report.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                            report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {priorityInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(report.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getAgeInDays(report.createdAt)} days ago
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report._id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        )}

            {/* Pagination */}
            {allReportsPagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to <span className="font-medium">{Math.min(currentPage * 10, allReportsPagination.total)}</span> of <span className="font-medium">{allReportsPagination.total}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                    Page {currentPage} of {allReportsPagination.pages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, allReportsPagination.pages))}
                    disabled={currentPage === allReportsPagination.pages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <ReportDetail
            reportId={selectedReport._id}
            onClose={() => setSelectedReport(null)}
            isAdmin={true}
          />
        )}
      </div>
    </div>
  );
};

export default ReportManagement;
