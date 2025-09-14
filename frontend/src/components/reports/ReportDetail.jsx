import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  X, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Tag,
  Calendar,
  User,
  Building,
  Send,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { getReport, addComment, updateReport, clearReportError } from '../../redux/slices/reportSlice';
import ResolutionModal from '../modals/ResolutionModal';

const ReportDetail = ({ reportId, onClose, isAdmin = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    currentReport, 
    currentReportLoading, 
    currentReportError 
  } = useSelector((state) => state.reports);

  const [newComment, setNewComment] = useState('');
  const [showInternalComments, setShowInternalComments] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (reportId) {
      dispatch(getReport(reportId));
    }
  }, [reportId, dispatch]);

  useEffect(() => {
    if (currentReportError) {
      toast.error(currentReportError);
      dispatch(clearReportError('currentReport'));
    }
  }, [currentReportError, dispatch]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await dispatch(addComment({
        reportId,
        message: newComment.trim(),
        isInternal: false
      })).unwrap();
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    if (newStatus === 'resolved') {
      // Show resolution modal for resolved status
      setPendingStatus(newStatus);
      setShowResolutionModal(true);
    } else {
      // Update status directly for other statuses
      performStatusUpdate(newStatus);
    }
  };

  const performStatusUpdate = async (newStatus, resolution = null) => {
    try {
      setIsUpdatingStatus(true);
      const updateData = { status: newStatus };
      
      // Add resolution if provided
      if (resolution) {
        updateData.resolution = resolution;
        updateData.resolvedBy = user._id;
        updateData.resolvedAt = new Date().toISOString();
      }
      
      await dispatch(updateReport({ reportId, updateData })).unwrap();
      toast.success(`Report status updated to ${newStatus.replace('_', ' ')}`);
      
      // Reload the report to get updated data
      dispatch(getReport(reportId));
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResolutionSubmit = (resolution) => {
    setShowResolutionModal(false);
    performStatusUpdate(pendingStatus, resolution);
    setPendingStatus(null);
  };

  const handleResolutionCancel = () => {
    setShowResolutionModal(false);
    setPendingStatus(null);
  };

  const getStatusConfig = (status) => {
    const configs = {
      open: { label: 'Open', color: 'text-blue-600 bg-blue-100', icon: Clock },
      in_progress: { label: 'In Progress', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle },
      resolved: { label: 'Resolved', color: 'text-green-600 bg-green-100', icon: CheckCircle },
      closed: { label: 'Closed', color: 'text-gray-600 bg-gray-100', icon: XCircle },
      rejected: { label: 'Rejected', color: 'text-red-600 bg-red-100', icon: XCircle }
    };
    return configs[status] || configs.open;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { label: 'Low', color: 'text-green-600' },
      medium: { label: 'Medium', color: 'text-yellow-600' },
      high: { label: 'High', color: 'text-orange-600' },
      urgent: { label: 'Urgent', color: 'text-red-600' }
    };
    return configs[priority] || configs.medium;
  };

  const getCategoryConfig = (category) => {
    const configs = {
      technical_issue: { label: 'Technical Issue', color: 'bg-red-100 text-red-800' },
      service_complaint: { label: 'Service Complaint', color: 'bg-orange-100 text-orange-800' },
      payment_issue: { label: 'Payment Issue', color: 'bg-yellow-100 text-yellow-800' },
      delivery_problem: { label: 'Delivery Problem', color: 'bg-purple-100 text-purple-800' },
      communication_issue: { label: 'Communication Issue', color: 'bg-blue-100 text-blue-800' },
      account_issue: { label: 'Account Issue', color: 'bg-indigo-100 text-indigo-800' },
      feature_request: { label: 'Feature Request', color: 'bg-green-100 text-green-800' },
      bug_report: { label: 'Bug Report', color: 'bg-pink-100 text-pink-800' },
      other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
    };
    return configs[category] || configs.other;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (currentReportLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Report not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The report you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentReport.status);
  const priorityConfig = getPriorityConfig(currentReport.priority);
  const categoryConfig = getCategoryConfig(currentReport.category);
  const StatusIcon = statusConfig.icon;

  // Filter comments based on user role and visibility
  const visibleComments = currentReport.comments?.filter(comment => 
    !comment.isInternal || (isAdmin && comment.isInternal)
  ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Report Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                #{currentReport._id.slice(-8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Report Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentReport.title}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${categoryConfig.color}`}>
                    {categoryConfig.label}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.color}`}>
                    <StatusIcon className="w-4 h-4 inline mr-1" />
                    {statusConfig.label}
                  </span>
                  <span className={`text-sm font-medium ${priorityConfig.color}`}>
                    {priorityConfig.label} Priority
                  </span>
                </div>
                
                {/* Admin Status Update Buttons */}
                {isAdmin && currentReport.status !== 'resolved' && currentReport.status !== 'closed' && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status:</span>
                    {currentReport.status === 'open' && (
                      <button
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingStatus ? 'Updating...' : 'Mark as In Progress'}
                      </button>
                    )}
                    {currentReport.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate('resolved')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingStatus ? 'Updating...' : 'Mark as Resolved'}
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate('closed')}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingStatus ? 'Updating...' : 'Close Report'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Report Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(currentReport.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Age: {getAgeInDays(currentReport.createdAt)} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    Reporter: {currentReport.reporter?.name || currentReport.reporter?.companyName || 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {currentReport.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Assigned to: {currentReport.assignedTo.name || currentReport.assignedTo.companyName}</span>
                  </div>
                )}
                {currentReport.resolvedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolved: {formatDate(currentReport.resolvedAt)}</span>
                  </div>
                )}
                {currentReport.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    <span>Updated: {formatDate(currentReport.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {currentReport.description}
              </p>
            </div>
          </div>

          {/* Related Information */}
          {(currentReport.relatedShipment || currentReport.relatedBid) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Related Information
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                {currentReport.relatedShipment && (
                  <div className="mb-2">
                    <span className="font-medium text-blue-800 dark:text-blue-200">Shipment:</span>
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      {currentReport.relatedShipment.trackingNumber || currentReport.relatedShipment._id}
                    </span>
                  </div>
                )}
                {currentReport.relatedBid && (
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Bid:</span>
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      ${currentReport.relatedBid.amount} - {currentReport.relatedBid.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {currentReport.tags && currentReport.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentReport.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {currentReport.resolution && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Resolution
              </h4>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentReport.resolution}
                </p>
                {currentReport.resolvedBy && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Resolved by: {currentReport.resolvedBy.name || currentReport.resolvedBy.companyName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comments ({visibleComments.length})
              </h4>
              {isAdmin && currentReport.comments?.some(comment => comment.isInternal) && (
                <button
                  onClick={() => setShowInternalComments(!showInternalComments)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  {showInternalComments ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showInternalComments ? 'Hide' : 'Show'} Internal Comments
                </button>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {currentReport.comments?.map((comment, index) => {
                const isInternal = comment.isInternal;
                const shouldShow = !isInternal || (isAdmin && showInternalComments);
                
                if (!shouldShow) return null;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isInternal
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.user?.name || comment.user?.companyName || 'Unknown User'}
                        </span>
                        {isInternal && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                            Internal
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {comment.message}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Comment
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add your comment here..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Add Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={showResolutionModal}
        onClose={handleResolutionCancel}
        onSubmit={handleResolutionSubmit}
        reportTitle={currentReport?.title}
        loading={isUpdatingStatus}
      />
    </div>
  );
};

export default ReportDetail;
