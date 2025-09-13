import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { ClipboardCheck, Users, Truck, AlertTriangle, BarChart2, UserCircle, Package, Wallet, MessageSquare, Shield, Settings, Eye, ArrowRight, TrendingUp, Activity, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchDashboardData, fetchTotalUsers, fetchNormalUsersCount } from '../../redux/slices/adminSlice';
import isEqual from 'lodash.isequal';
import { ProfilePictureModal } from '../../components/forms/ProfileForm';
import { getProfilePictureUrl } from '../../utils/imageUtils';

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const didFetch = useRef(false);
  const prevDataRef = useRef(null);

  const { user } = useSelector(state => state.auth);
  const { 
    users = [], 
    logisticsPending = [], 
    logisticsVerified = [], 
    disputes = [], 
    analytics = {}, 
    loading, 
    totalUsers, 
    normalUsersCount 
  } = 
    useSelector(state => state.admin);

  console.log('AdminDashboardHome - User:', user);
  console.log('AdminDashboardHome - Loading:', loading);
  console.log('AdminDashboardHome - Users (from adminSlice):', users);
  console.log('AdminDashboardHome - Logistics Pending (from adminSlice):', logisticsPending);
  console.log('AdminDashboardHome - Logistics Verified (from adminSlice):', logisticsVerified);
  console.log('AdminDashboardHome - Disputes (from adminSlice):', disputes);
  console.log('AdminDashboardHome - Analytics (from adminSlice):', analytics);
  console.log('AdminDashboardHome - Total Users (from adminSlice):', totalUsers);
  console.log('AdminDashboardHome - Normal Users Count (from adminSlice):', normalUsersCount);

  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());


  const fetchAndUpdate = async () => {
    await dispatch(fetchDashboardData());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAndUpdate();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch data once when component mounts
    if (!didFetch.current) {
      fetchAndUpdate();
      setLastUpdated(new Date());
      didFetch.current = true;
    }
  }, [dispatch]);

  const adminProfile = {
    name: user?.name || 'Admin',
    role: user?.role || 'Administrator',
    avatar: getProfilePictureUrl(user?.profilePicture), // Modified: Use the constructed URL
  };

  // Debug logging
  console.log('Admin Dashboard - User data:', user);
  console.log('Admin Dashboard - Profile picture path:', user?.profilePicture);
  console.log('Admin Dashboard - Constructed avatar URL:', adminProfile.avatar);

  const modules = [
    { name: 'Verified Logistics', description: 'Approved logistics companies.', icon: <Truck size={24} />, color: 'from-blue-500 to-indigo-600', path: '/admin/logistics-list', count: analytics?.logistics?.verified || 0 },
    { name: 'Pending Logistics', description: 'Browse and manage pending logistics companies verifications.', icon: <ClipboardCheck size={24} />, color: 'from-orange-500 to-red-600', path: '/admin/verify-logistics', count: analytics?.logistics?.pending || 0 },
    { name: 'Total Users', description: 'Total number of registered users on the platform.', icon: <Users size={24} />, color: 'from-green-500 to-emerald-600', path: '/admin/users/total', count: analytics?.users?.total || 0 },
  ];

  console.log('AdminDashboardHome - Modules Array (with counts):', modules);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-2xl shadow-lg mb-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left Content */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Shield className="text-white text-lg" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold">
                      Welcome back, {adminProfile.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm font-medium">
                        🔒 Admin Access
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium">
                        📊 {analytics?.users?.total || 0} Total Users
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-purple-100 text-base mb-6 max-w-2xl leading-relaxed">
                  Manage your platform efficiently. Monitor users, verify logistics companies, and oversee system operations with comprehensive admin controls.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/admin/verify-logistics')}
                    className="px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-300 font-medium shadow-md flex items-center gap-2 text-sm"
                  >
                    <ClipboardCheck size={16} />
                    Manage Verifications
                  </button>
                  <button
                    onClick={() => navigate('/admin/users/total')}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20 text-sm"
                  >
                    <Users size={16} />
                    View All Users
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>
              </div>
              
              {/* Right Content - Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {adminProfile.avatar ? (
                    <img
                      src={adminProfile.avatar}
                      alt="Admin Avatar"
                      className="w-20 h-20 rounded-xl border-4 border-white/30 object-cover cursor-pointer shadow-lg hover:scale-105 transition-transform duration-300"
                      onClick={() => setShowProfilePicModal(true)}
                      onError={(e) => {
                        console.error("Profile picture failed to load:", e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback avatar */}
                  <div 
                    className={`w-20 h-20 rounded-xl border-4 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold shadow-lg ${adminProfile.avatar ? 'hidden' : 'flex'}`}
                    style={{ display: adminProfile.avatar ? 'none' : 'flex' }}
                    onClick={() => setShowProfilePicModal(true)}
                  >
                    {adminProfile.name ? adminProfile.name[0].toUpperCase() : 'A'}
                  </div>
                  
                  {/* Admin Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 border-4 border-white rounded-full flex items-center justify-center">
                    <Shield size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Users Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <Users size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{analytics?.users?.total || 0}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Total Users</h3>
                <p className="text-sm text-gray-600">All registered users</p>
              </div>
            </div>

            {/* Verified Logistics Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <CheckCircle size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{analytics?.logistics?.verified || 0}</p>
                    <p className="text-sm text-gray-500">Verified</p>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Verified Logistics</h3>
                <p className="text-sm text-gray-600">Approved companies</p>
              </div>
            </div>

            {/* Pending Logistics Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <Clock size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{analytics?.logistics?.pending || 0}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Pending Logistics</h3>
                <p className="text-sm text-gray-600">Awaiting verification</p>
              </div>
            </div>

            {/* Disputes Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{disputes?.length || 0}</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Disputes</h3>
                <p className="text-sm text-gray-600">Requiring attention</p>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Modules Section */}
        <section className="mb-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Settings className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Admin Controls</h2>
                    <p className="text-purple-100 text-sm">Manage platform operations and user verifications</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-white font-medium text-sm">
                      {modules.length} Modules
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(mod.path)}
                    className="group relative cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg hover:border-purple-200 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Notification Badge */}
                    {mod.count > 0 && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {mod.count}
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        {mod.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                          {mod.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {mod.description}
                        </p>
                        <div className="flex items-center text-purple-600 font-medium text-sm group-hover:text-purple-700 transition-colors duration-300">
                          <span>Access Module</span>
                          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* Status Bar */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Dashboard Status</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* New: Render ProfilePictureModal */}
      {showProfilePicModal && (
        <ProfilePictureModal imageUrl={adminProfile.avatar} onClose={() => setShowProfilePicModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboardHome;
