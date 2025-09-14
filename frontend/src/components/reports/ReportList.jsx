import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Eye,
  MessageSquare,
  Tag,
  Filter,
  Search,
  Plus,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { getUserReports, clearReportError } from '../../redux/slices/reportSlice';

const ReportList = ({ onViewReport, onCreateReport, showCreateButton = true }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    userReports, 
    userReportsLoading, 
    userReportsError, 
    userReportsPagination 
  } = useSelector((state) => state.reports);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

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
    loadReports();
  }, [currentPage, filters]);

  useEffect(() => {
    if (userReportsError) {
      console.error('Error loading reports:', userReportsError);
      dispatch(clearReportError('userReports'));
    }
  }, [userReportsError, dispatch]);

  const loadReports = () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...filters
    };
    dispatch(getUserReports(params));
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

  if (userReportsLoading && userReports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Reports
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your submitted reports
          </p>
        </div>
        {showCreateButton && (
          <button
            onClick={onCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Priorities</option>
                {Object.entries(priorityConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Reports List */}
      {userReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No reports found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filters.search || filters.status || filters.category || filters.priority
              ? 'Try adjusting your filters'
              : 'You haven\'t submitted any reports yet'
            }
          </p>
          {showCreateButton && !filters.search && !filters.status && !filters.category && !filters.priority && (
            <button
              onClick={onCreateReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Report
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {userReports.map((report) => {
            const categoryInfo = getCategoryInfo(report.category);
            const statusInfo = getStatusInfo(report.status);
            const priorityInfo = getPriorityInfo(report.priority);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={report._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onViewReport(report)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {report.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {statusInfo.label}
                    </span>
                    <span className={`text-xs font-medium ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </span>
                    {/* Show "NEW" indicator for recently updated reports */}
                    {report.updatedAt && new Date(report.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                      <span className="px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(report.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getAgeInDays(report.createdAt)} days ago
                    </div>
                    {report.updatedAt && report.updatedAt !== report.createdAt && (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <AlertCircle className="w-4 h-4" />
                        Updated {formatDate(report.updatedAt)}
                      </div>
                    )}
                    {report.comments && report.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {report.comments.length} comments
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {report.tags && report.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {report.tags.length}
                      </div>
                    )}
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {userReportsPagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {userReportsPagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, userReportsPagination.pages))}
            disabled={currentPage === userReportsPagination.pages}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportList;
