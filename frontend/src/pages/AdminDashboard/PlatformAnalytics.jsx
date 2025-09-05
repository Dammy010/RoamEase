import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../../redux/slices/adminSlice";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Download,
  Eye,
  Minus,
  Shield,
  Settings,
  User
} from "lucide-react";

const PlatformAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.admin);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (rate) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rate < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (rate) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Analytics data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  // Mock growth data (in real app, this would come from backend)
  const mockGrowthData = {
    users: { current: analytics.users?.total || 0, previous: 850, growth: 12.5 },
    logistics: { current: analytics.logistics?.verified || 0, previous: 45, growth: 8.2 },
    shipments: { current: analytics.shipments?.total || 0, previous: 120, growth: 15.3 },
    bids: { current: analytics.bids?.total || 0, previous: 340, growth: 22.1 },
    disputes: { current: analytics.disputes?.open || 0, previous: 8, growth: -25.0 }
  };

  const mainMetrics = [
    {
      title: "Total Users",
      value: analytics.users?.total || 0,
      growth: mockGrowthData.users.growth,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      description: "Registered platform users"
    },
    {
      title: "Verified Logistics",
      value: analytics.logistics?.verified || 0,
      growth: mockGrowthData.logistics.growth,
      icon: Building2,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      description: "Verified logistics companies"
    },
    {
      title: "Total Shipments",
      value: analytics.shipments?.total || 0,
      growth: mockGrowthData.shipments.growth,
      icon: Package,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      description: "All time shipments"
    },
    {
      title: "Open Disputes",
      value: analytics.disputes?.open || 0,
      growth: mockGrowthData.disputes.growth,
      icon: AlertTriangle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      description: "Active disputes requiring attention"
    }
  ];

  const detailedMetrics = [
    {
      category: "Users",
      metrics: [
        { label: "Total Users", value: analytics.users?.total || 0, icon: Users },
        { label: "Normal Users", value: analytics.users?.normalUsersCount || 0, icon: User },
        { label: "Logistics Total", value: analytics.logistics?.total || 0, icon: Building2 },
        { label: "Verified Logistics", value: analytics.logistics?.verified || 0, icon: CheckCircle },
        { label: "Pending Logistics", value: analytics.logistics?.pending || 0, icon: Clock }
      ]
    },
    {
      category: "Shipments",
      metrics: [
        { label: "Total Shipments", value: analytics.shipments?.total || 0, icon: Package },
        { label: "Open Shipments", value: analytics.shipments?.open || 0, icon: Clock },
        { label: "Accepted Shipments", value: analytics.shipments?.accepted || 0, icon: CheckCircle },
        { label: "Completed Shipments", value: analytics.shipments?.completed || 0, icon: CheckCircle },
        { label: "Delivered Shipments", value: analytics.shipments?.delivered || 0, icon: Package },
        { label: "Received Shipments", value: analytics.shipments?.received || 0, icon: CheckCircle }
      ]
    },
    {
      category: "Business",
      metrics: [
        { label: "Total Bids", value: analytics.bids?.total || 0, icon: Target },
        { label: "Open Disputes", value: analytics.disputes?.open || 0, icon: AlertTriangle }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Platform Analytics
                </h1>
                <p className="text-gray-500">
                  Comprehensive insights and performance metrics
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button
                onClick={() => dispatch(fetchDashboardData())}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh analytics"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${metric.textColor}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getGrowthIcon(metric.growth)}
                    <span className={`text-sm font-medium ${getGrowthColor(metric.growth)}`}>
                      {metric.growth > 0 ? '+' : ''}{metric.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{formatNumber(metric.value)}</h3>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                </div>
                
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {detailedMetrics.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                {category.category}
              </h3>
              
              <div className="space-y-3">
                {category.metrics.map((metric, metricIndex) => {
                  const IconComponent = metric.icon;
                  return (
                    <div
                      key={metricIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{formatNumber(metric.value)}</span>
                    </div>
                  );
                })}
              </div>
          </div>
        ))}
        </div>

        {/* Shipment Status Breakdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Package className="w-4 h-4 text-white" />
            </div>
            Shipment Status Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { 
                status: "Open", 
                count: analytics.shipments?.statusBreakdown?.open || 0, 
                color: "bg-orange-100 text-orange-800",
                icon: Clock,
                description: "Available for bidding"
              },
              { 
                status: "Accepted", 
                count: analytics.shipments?.statusBreakdown?.accepted || 0, 
                color: "bg-blue-100 text-blue-800",
                icon: CheckCircle,
                description: "Bid accepted, in progress"
              },
              { 
                status: "Completed", 
                count: analytics.shipments?.statusBreakdown?.completed || 0, 
                color: "bg-green-100 text-green-800",
                icon: CheckCircle,
                description: "Logistics completed delivery"
              },
              { 
                status: "Delivered", 
                count: analytics.shipments?.statusBreakdown?.delivered || 0, 
                color: "bg-purple-100 text-purple-800",
                icon: Package,
                description: "Delivered, awaiting confirmation"
              },
              { 
                status: "Received", 
                count: analytics.shipments?.statusBreakdown?.received || 0, 
                color: "bg-emerald-100 text-emerald-800",
                icon: CheckCircle,
                description: "User confirmed receipt"
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>
                  <h4 className="font-bold text-2xl text-gray-900 mb-1">{item.count}</h4>
                  <p className="text-sm font-medium text-gray-700 mb-1">{item.status}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              );
            })}
          </div>
          
          {/* Completion Rate */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Shipment Completion Rate</h4>
                <p className="text-sm text-gray-600">
                  {analytics.shipments?.total > 0 
                    ? `${Math.round(((analytics.shipments?.statusBreakdown?.received || 0) / analytics.shipments.total) * 100)}%`
                    : '0%'
                  } of shipments successfully received by users
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.shipments?.statusBreakdown?.received || 0}
                </div>
                <div className="text-sm text-gray-500">Received</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Health Indicators */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-4 h-4 text-white" />
            </div>
            Platform Health
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">System Status</h4>
              <p className="text-sm text-green-600 font-medium">Operational</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Performance</h4>
              <p className="text-sm text-blue-600 font-medium">Excellent</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Security</h4>
              <p className="text-sm text-purple-600 font-medium">Secure</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <Settings className="w-4 h-4 text-white" />
            </div>
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Export Data</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">View Reports</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Generate Charts</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
