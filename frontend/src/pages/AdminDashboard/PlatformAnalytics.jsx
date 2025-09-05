import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../../redux/slices/adminSlice";

const PlatformAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (!analytics) return <p className="p-6">Loading analytics...</p>;

  const stats = [
    { label: "Total Users", value: analytics.users.total },
    { label: "Logistics (Verified)", value: analytics.logistics.verified },
    { label: "Shipments (Open)", value: analytics.shipments.open },
    { label: "Disputes (Open)", value: analytics.disputes.open },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">📊 Platform Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformAnalytics;
