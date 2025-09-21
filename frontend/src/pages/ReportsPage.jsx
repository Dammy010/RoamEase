import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Filter, Search, ArrowLeft } from "lucide-react";
import ReportList from "../components/reports/ReportList";
import ReportForm from "../components/forms/ReportForm";
import ReportDetail from "../components/reports/ReportDetail";

const ReportsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
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

  // Determine navigation path based on user role
  const getBackPath = () => {
    if (user?.role === "logistics") {
      return "/logistics/dashboard";
    } else if (user?.role === "admin") {
      return "/admin/dashboard";
    } else {
      return "/user/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-blue-600 rounded-2xl shadow-lg mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => navigate(getBackPath())}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Reports
                    </h1>
                    <p className="text-indigo-100 text-lg">
                      Submit and track your reports and issues
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <span className="text-white font-semibold text-lg">
                    Report Issues
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
          <ReportList
            onViewReport={handleViewReport}
            onCreateReport={handleCreateReport}
            showCreateButton={true}
          />
        </div>

        {/* Create Report Modal */}
        {showCreateForm && (
          <ReportForm isOpen={showCreateForm} onClose={handleCloseForm} />
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
