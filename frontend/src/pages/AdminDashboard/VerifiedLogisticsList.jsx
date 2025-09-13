import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData, deleteUser, suspendUser } from "../../redux/slices/adminSlice";
import { toast } from "react-toastify";
import UserEditModal from "../../components/shared/UserEditModal";
import { 
  Truck, Search, Filter, SortAsc, MoreVertical, Edit, Trash2, 
  UserCheck, UserX, Shield, Mail, Phone, Calendar, MapPin, 
  Building2, Eye, AlertCircle, CheckCircle, Clock, RefreshCw,
  Download, Plus, Settings, ArrowLeft, ArrowRight, ChevronDown,
  Award, Star, Globe, FileText, Users, TrendingUp, Activity
} from 'lucide-react';

const VerifiedLogisticsList = () => {
  const dispatch = useDispatch();
  const { logisticsVerified, loading, error } = useSelector((state) => state.admin);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('companyName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this logistics company? This action cannot be undone.")) {
      await dispatch(deleteUser(userId));
    }
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (window.confirm(`Are you sure you want to ${newStatus} this logistics company?`)) {
      await dispatch(suspendUser({ userId, newStatus }));
    }
  };

  const handleEditUser = (user) => {
    setCurrentUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
  };

  // Filter and sort logistics companies
  const filteredCompanies = logisticsVerified.filter(company => {
    const matchesSearch = (company.companyName || company.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.country || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && company.isActive !== false) ||
                         (filterStatus === 'suspended' && company.isActive === false);
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'companyName':
        aValue = (a.companyName || a.name || '').toLowerCase();
        bValue = (b.companyName || b.name || '').toLowerCase();
        break;
      case 'email':
        aValue = (a.email || '').toLowerCase();
        bValue = (b.email || '').toLowerCase();
        break;
      case 'country':
        aValue = (a.country || '').toLowerCase();
        bValue = (b.country || '').toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      default:
        aValue = (a.companyName || a.name || '').toLowerCase();
        bValue = (b.companyName || b.name || '').toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (isActive) => {
    return isActive === false 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusIcon = (isActive) => {
    return isActive === false ? <UserX className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Truck className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Verified Logistics</h3>
          <p className="text-gray-500">Please wait while we fetch verified logistics companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Logistics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchDashboardData())}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium"
          >
            Try Again
          </button>
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center">
                    <Truck className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Verified Logistics Companies</h1>
                    <p className="text-green-100 text-base">Manage approved logistics partners</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{logisticsVerified.length}</div>
                  <div className="text-green-100 text-sm">Verified Companies</div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                
                <div className="relative">
                  <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="companyName-asc">Company A-Z</option>
                    <option value="companyName-desc">Company Z-A</option>
                    <option value="email-asc">Email A-Z</option>
                    <option value="email-desc">Email Z-A</option>
                    <option value="country-asc">Country A-Z</option>
                    <option value="country-desc">Country Z-A</option>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{logisticsVerified.length}</div>
                      <div className="text-sm text-green-600">Total Verified</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{logisticsVerified.filter(c => c.isActive !== false).length}</div>
                      <div className="text-sm text-blue-600">Active Companies</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserX className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{logisticsVerified.filter(c => c.isActive === false).length}</div>
                      <div className="text-sm text-orange-600">Suspended</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">100%</div>
                      <div className="text-sm text-purple-600">Verification Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck size={20} />
              Verified Companies List ({filteredCompanies.length} found)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="text-green-400 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {searchTerm || filterStatus !== 'all' ? 'No Matching Companies' : 'No Verified Companies'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search criteria to find companies.'
                    : 'No logistics companies have been verified yet.'
                  }
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Company</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Contact</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Location</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Verified</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedCompanies.map((company, idx) => (
                    <tr key={company._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                            {(company.companyName || company.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {company.companyName || company.name || 'Unknown Company'}
                            </div>
                            <div className="text-sm text-gray-500">ID: {company._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            {company.email}
                          </div>
                          {company.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone size={14} />
                              {company.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          {company.country || 'N/A'}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(company.isActive)}`}>
                          {getStatusIcon(company.isActive)}
                          {company.isActive === false ? 'Suspended' : 'Active'}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle size={14} />
                          <span className="font-medium">Verified</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(company)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Edit Company"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(company._id, company.isActive ? 'active' : 'suspended')}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              company.isActive === false 
                                ? 'text-green-600 hover:bg-green-100' 
                                : 'text-yellow-600 hover:bg-yellow-100'
                            }`}
                            title={company.isActive === false ? 'Activate Company' : 'Suspend Company'}
                          >
                            {company.isActive === false ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(company._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Delete Company"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <UserEditModal
          user={currentUserToEdit}
          onClose={handleCloseEditModal}
          onSave={(updatedUser) => {
            console.log('Updated user', updatedUser);
            handleCloseEditModal();
          }}
        />
      )}
    </div>
  );
};

export default VerifiedLogisticsList;