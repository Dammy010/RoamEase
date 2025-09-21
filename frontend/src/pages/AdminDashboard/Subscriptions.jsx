import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../contexts/ThemeContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import {
  getAllSubscriptions,
  clearError,
} from "../../redux/slices/subscriptionSlice";
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  Download,
  Eye,
  Calendar,
  User,
  Mail,
  Phone,
  Crown,
  Shield,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  ArrowLeft,
} from "lucide-react";

const AdminSubscriptions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { formatCurrency } = useCurrency();

  const {
    allSubscriptions,
    adminLoading,
    adminError,
    subscriptionSummary,
    pagination,
  } = useSelector((state) => state.subscription);

  const [filters, setFilters] = useState({
    userType: "logistics",
    status: "all",
    plan: "all",
    upgradeType: "all", // all, upgraded, new
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, [filters]);

  useEffect(() => {
    if (adminError) {
      toast.error(adminError);
      dispatch(clearError());
    }
  }, [adminError, dispatch]);

  const fetchSubscriptions = () => {
    dispatch(getAllSubscriptions(filters));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "inactive":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case "basic":
        return <Shield className="w-5 h-5 text-blue-500" />;
      case "premium":
        return <Crown className="w-5 h-5 text-purple-500" />;
      case "enterprise":
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case "basic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "premium":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "enterprise":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Pricing structure matching the backend
  const getPricingInfo = (plan, billingCycle) => {
    const pricing = {
      basic: {
        weekly: { price: 15600, originalPrice: 20000, discount: 22 },
        monthly: { price: 45600, originalPrice: 60000, discount: 24 },
        yearly: { price: 119600, originalPrice: 187200, discount: 36 },
      },
      premium: {
        weekly: { price: 25600, originalPrice: 32000, discount: 20 },
        monthly: { price: 65600, originalPrice: 82000, discount: 20 },
        yearly: { price: 319600, originalPrice: 475200, discount: 33 },
      },
      enterprise: {
        weekly: { price: 40600, originalPrice: 50000, discount: 19 },
        monthly: { price: 150600, originalPrice: 190000, discount: 21 },
        yearly: { price: 799600, originalPrice: 1195200, discount: 33 },
      },
    };

    return (
      pricing[plan]?.[billingCycle] || {
        price: 0,
        originalPrice: 0,
        discount: 0,
      }
    );
  };

  const filteredSubscriptions = allSubscriptions.filter((subscription) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        subscription.user?.name?.toLowerCase().includes(searchLower) ||
        subscription.user?.email?.toLowerCase().includes(searchLower) ||
        subscription.plan.toLowerCase().includes(searchLower) ||
        subscription.status.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Upgrade type filter
    if (filters.upgradeType === "upgraded") {
      return subscription.metadata?.upgradeFrom;
    } else if (filters.upgradeType === "new") {
      return !subscription.metadata?.upgradeFrom;
    }

    return true;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Subscription Management
                    </h1>
                    <p className="text-indigo-100 mt-1">
                      Monitor and manage all user subscriptions and billing
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {subscriptionSummary?.totalSubscriptions || 0}
                  </div>
                  <div className="text-indigo-100 text-sm">
                    Total Subscriptions
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={fetchSubscriptions}
                    disabled={adminLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        adminLoading ? "animate-spin" : ""
                      }`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {subscriptionSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(() => {
                      // Calculate total revenue using pricing structure instead of database amounts
                      const totalPricingRevenue = allSubscriptions.reduce(
                        (sum, sub) => {
                          const pricingInfo = getPricingInfo(
                            sub.plan,
                            sub.billingCycle
                          );
                          return sum + pricingInfo.price;
                        },
                        0
                      );

                      return (
                        <>
                          ₦
                          {totalPricingRevenue.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      );
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    DB Revenue:{" "}
                    {subscriptionSummary.totalRevenue.toLocaleString()} kobo
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Subscriptions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {subscriptionSummary.totalSubscriptions}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Subscriptions
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {subscriptionSummary.activeSubscriptions}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(() => {
                      // Calculate average using pricing structure instead of database amounts
                      const totalPricingAmount = allSubscriptions.reduce(
                        (sum, sub) => {
                          const pricingInfo = getPricingInfo(
                            sub.plan,
                            sub.billingCycle
                          );
                          return sum + pricingInfo.price;
                        },
                        0
                      );
                      const averagePricingAmount =
                        allSubscriptions.length > 0
                          ? totalPricingAmount / allSubscriptions.length
                          : 0;

                      return (
                        <>
                          ₦
                          {averagePricingAmount.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      );
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    DB Average:{" "}
                    {subscriptionSummary.averageAmount.toLocaleString()} kobo
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Upgrade Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Upgraded Subscriptions
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {
                      allSubscriptions.filter(
                        (sub) => sub.metadata?.upgradeFrom
                      ).length
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {allSubscriptions.length > 0
                      ? Math.round(
                          (allSubscriptions.filter(
                            (sub) => sub.metadata?.upgradeFrom
                          ).length /
                            allSubscriptions.length) *
                            100
                        )
                      : 0}
                    % of total
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Type
              </label>
              <select
                value={filters.userType}
                onChange={(e) => handleFilterChange("userType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Users</option>
                <option value="logistics">Logistics</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan
              </label>
              <select
                value={filters.plan}
                onChange={(e) => handleFilterChange("plan", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Upgrade Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.upgradeType}
                onChange={(e) =>
                  handleFilterChange("upgradeType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="new">New Subscriptions</option>
                <option value="upgraded">Upgraded</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Subscriptions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscriptions ({filteredSubscriptions.length})
            </h3>
          </div>

          {adminLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Loading subscriptions...
                </p>
              </div>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No subscriptions found
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getPlanIcon(subscription.plan)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {subscription.user?.name || "Unknown User"}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(
                              subscription.plan
                            )}`}
                          >
                            {subscription.plan.charAt(0).toUpperCase() +
                              subscription.plan.slice(1)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              subscription.status
                            )}`}
                          >
                            {subscription.status.charAt(0).toUpperCase() +
                              subscription.status.slice(1)}
                          </span>
                          {/* Upgrade Indicator */}
                          {subscription.metadata?.upgradeFrom && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>
                                Upgraded from{" "}
                                {subscription.metadata.upgradeFrom}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>
                              {subscription.user?.email || "No email"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                subscription.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CreditCard className="w-4 h-4" />
                            <span>{subscription.billingCycle}</span>
                          </div>
                          {/* Upgrade Details */}
                          {subscription.metadata?.upgradeFrom && (
                            <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                              <TrendingUp className="w-4 h-4" />
                              <span>
                                Upgraded from{" "}
                                {subscription.metadata.upgradeFrom} (
                                {subscription.metadata.upgradeFromBillingCycle})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const pricingInfo = getPricingInfo(
                          subscription.plan,
                          subscription.billingCycle
                        );
                        // Use the pricing info amount instead of database amount
                        const actualAmount = pricingInfo.price;
                        const originalAmount = pricingInfo.originalPrice;
                        const discount = pricingInfo.discount;

                        return (
                          <>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              ₦
                              {actualAmount.toLocaleString("en-NG", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            {originalAmount > 0 && discount > 0 && (
                              <div className="flex items-center justify-end space-x-2 mb-1">
                                <span className="text-sm text-gray-500 line-through">
                                  ₦
                                  {originalAmount.toLocaleString("en-NG", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs font-semibold">
                                  {discount}% OFF
                                </span>
                              </div>
                            )}
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {subscription.currency} •{" "}
                              {subscription.billingCycle}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              DB amount: {subscription.amount} kobo | Pricing: ₦
                              {actualAmount} | Original: ₦{originalAmount}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * filters.limit,
                    pagination.totalSubscriptions
                  )}{" "}
                  of {pagination.totalSubscriptions} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                    {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
