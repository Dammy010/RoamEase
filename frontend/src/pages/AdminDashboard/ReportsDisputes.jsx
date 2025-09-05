import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../../redux/slices/adminSlice";
import { AlertTriangle, CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react";

const ReportsDisputes = () => {
  const dispatch = useDispatch();
  const { disputes } = useSelector((state) => state.admin);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_review':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === 'all') return true;
    return dispute.status === filter;
  });

  const handleResolve = (disputeId) => {
    // TODO: Implement dispute resolution
    console.log('Resolving dispute:', disputeId);
  };

  const handleReject = (disputeId) => {
    // TODO: Implement dispute rejection
    console.log('Rejecting dispute:', disputeId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">⚖️ Reports & Disputes</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: 'all', label: 'All', count: disputes.length },
              { key: 'pending', label: 'Pending', count: disputes.filter(d => d.status === 'pending').length },
              { key: 'in_review', label: 'In Review', count: disputes.filter(d => d.status === 'in_review').length },
              { key: 'resolved', label: 'Resolved', count: disputes.filter(d => d.status === 'resolved').length },
              { key: 'rejected', label: 'Rejected', count: disputes.filter(d => d.status === 'rejected').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Disputes List */}
          <div className="space-y-4">
            {filteredDisputes.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No disputes found</p>
                <p className="text-gray-500">All disputes have been resolved or there are no active reports.</p>
              </div>
            ) : (
              filteredDisputes.map((dispute) => (
                <div key={dispute._id} className="border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(dispute.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {dispute.reason || "Dispute Report"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Reported by: {dispute.reportedBy?.name || "Unknown User"}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Shipment:</span> {dispute.shipment?.shipmentTitle || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Reported:</span> {new Date(dispute.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {dispute.type || "General"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Priority:</span> {dispute.priority || "Medium"}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Category:</span> {dispute.category || "Other"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Severity:</span> {dispute.severity || "Moderate"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Description:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {dispute.details || "No details provided."}
                      </p>
                    </div>

                    {dispute.evidence && dispute.evidence.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">Evidence:</h4>
                        <div className="flex flex-wrap gap-2">
                          {dispute.evidence.map((item, index) => (
                            <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm">
                              {item.type}: {item.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {dispute.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleResolve(dispute._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                        <button
                          onClick={() => handleReject(dispute._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Review Details
                        </button>
                      </div>
                    )}

                    {dispute.status === 'in_review' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleResolve(dispute._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDisputes;

