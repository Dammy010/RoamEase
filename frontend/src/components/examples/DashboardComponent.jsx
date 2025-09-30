import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../redux/slices/authSlice";
import { getSettings } from "../redux/slices/settingsSlice";
import { fetchUserShipments } from "../redux/slices/shipmentSlice";

// Example: Dashboard Component with Optimized API Calls
const DashboardComponent = () => {
  const dispatch = useDispatch();

  // Get data from Redux state
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { settings, loading: settingsLoading } = useSelector(
    (state) => state.settings
  );
  const { shipments, loading: shipmentsLoading } = useSelector(
    (state) => state.shipment
  );

  // Only fetch data if we don't have it and we're not already loading
  useEffect(() => {
    if (!user && !authLoading) {
      console.log("🔍 Dashboard: Fetching profile data");
      dispatch(fetchProfile());
    } else if (user) {
      console.log("📦 Dashboard: Using existing profile data");
    }
  }, [dispatch, user, authLoading]);

  useEffect(() => {
    if (!settings && !settingsLoading) {
      console.log("🔍 Dashboard: Fetching settings data");
      dispatch(getSettings());
    } else if (settings) {
      console.log("📦 Dashboard: Using existing settings data");
    }
  }, [dispatch, settings, settingsLoading]);

  useEffect(() => {
    if (!shipments.length && !shipmentsLoading) {
      console.log("🔍 Dashboard: Fetching shipments data");
      dispatch(fetchUserShipments());
    } else if (shipments.length) {
      console.log("📦 Dashboard: Using existing shipments data");
    }
  }, [dispatch, shipments.length, shipmentsLoading]);

  // Show loading state
  if (authLoading || settingsLoading || shipmentsLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <p>Name: {user?.name || "Loading..."}</p>
        <p>Email: {user?.email || "Loading..."}</p>
        <p>Role: {user?.role || "Loading..."}</p>
      </div>

      {/* Settings Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Settings</h2>
        <p>Currency: {settings?.currency || "Loading..."}</p>
        <p>Language: {settings?.language || "Loading..."}</p>
        <p>Timezone: {settings?.timezone || "Loading..."}</p>
      </div>

      {/* Shipments Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-2">My Shipments</h2>
        {shipments.length > 0 ? (
          <div className="space-y-2">
            {shipments.map((shipment) => (
              <div key={shipment._id} className="border p-2 rounded">
                <h3 className="font-medium">{shipment.shipmentTitle}</h3>
                <p className="text-sm text-gray-600">
                  Status: {shipment.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No shipments found</p>
        )}
      </div>

      {/* Cache Status Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Cache Status (Debug)</h3>
        <p>Profile Cache Valid: {user ? "Yes" : "No"}</p>
        <p>Settings Cache Valid: {settings ? "Yes" : "No"}</p>
        <p>Shipments Cache Valid: {shipments.length > 0 ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};

export default DashboardComponent;
