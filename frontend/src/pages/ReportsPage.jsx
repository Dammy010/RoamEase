import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FileText, Plus, Filter, Search } from 'lucide-react';
import ReportList from '../components/reports/ReportList';
import ReportForm from '../components/forms/ReportForm';
import ReportDetail from '../components/reports/ReportDetail';

const ReportsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleCreateReport = () => {
    setShowCreateForm(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Submit and track your reports and issues
              </p>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <ReportList
          onViewReport={handleViewReport}
          onCreateReport={handleCreateReport}
          showCreateButton={true}
        />

        {/* Create Report Modal */}
        {showCreateForm && (
          <ReportForm
            isOpen={showCreateForm}
            onClose={handleCloseForm}
          />
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <ReportDetail
            reportId={selectedReport._id}
            onClose={handleCloseDetail}
            isAdmin={false}
          />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
