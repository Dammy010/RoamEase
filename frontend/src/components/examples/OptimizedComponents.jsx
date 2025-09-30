import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useProfile,
  useSettings,
  useUserShipments,
  useDeliveredShipments,
} from "../hooks/useApiCall";
import { fetchProfile } from "../redux/slices/authSlice";
import { getSettings } from "../redux/slices/settingsSlice";
import {
  fetchUserShipments,
  fetchDeliveredShipments,
  updateShipmentStatus,
} from "../redux/slices/shipmentSlice";

// Example 1: Profile Component with proper caching
const ProfileComponent = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Use the custom hook - this will prevent duplicate calls
  const { data: profileData } = useProfile();

  // Only fetch if we don't have user data
  useEffect(() => {
    if (!user && !loading) {
      console.log("🔍 ProfileComponent: Fetching profile data");
      dispatch(fetchProfile());
    } else if (user) {
      console.log("📦 ProfileComponent: Using existing profile data");
    }
  }, [dispatch, user, loading]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
};

// Example 2: Settings Component with proper caching
const SettingsComponent = () => {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector((state) => state.settings);

  // Use the custom hook - this will prevent duplicate calls
  const { data: settingsData } = useSettings();

  // Only fetch if we don't have settings data
  useEffect(() => {
    if (!settings && !loading) {
      console.log("🔍 SettingsComponent: Fetching settings data");
      dispatch(getSettings());
    } else if (settings) {
      console.log("📦 SettingsComponent: Using existing settings data");
    }
  }, [dispatch, settings, loading]);

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Settings</h2>
      <p>Currency: {settings?.currency}</p>
      <p>Language: {settings?.language}</p>
      <p>Timezone: {settings?.timezone}</p>
    </div>
  );
};

// Example 3: Shipments Dashboard with proper caching
const ShipmentsDashboard = () => {
  const dispatch = useDispatch();
  const { shipments, loading, error } = useSelector((state) => state.shipment);

  // Use the custom hook - this will prevent duplicate calls
  const { data: shipmentsData } = useUserShipments();

  // Only fetch if we don't have shipments data
  useEffect(() => {
    if (!shipments.length && !loading) {
      console.log("🔍 ShipmentsDashboard: Fetching shipments data");
      dispatch(fetchUserShipments());
    } else if (shipments.length) {
      console.log("📦 ShipmentsDashboard: Using existing shipments data");
    }
  }, [dispatch, shipments.length, loading]);

  if (loading) return <div>Loading shipments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Shipments</h2>
      {shipments.map((shipment) => (
        <div key={shipment._id}>
          <h3>{shipment.shipmentTitle}</h3>
          <p>Status: {shipment.status}</p>
        </div>
      ))}
    </div>
  );
};

// Example 4: Delivered Shipments Component with proper caching
const DeliveredShipmentsComponent = () => {
  const dispatch = useDispatch();
  const { deliveredShipments, loading, error } = useSelector(
    (state) => state.shipment
  );

  // Use the custom hook - this will prevent duplicate calls
  const { data: deliveredData } = useDeliveredShipments();

  // Only fetch if we don't have delivered shipments data
  useEffect(() => {
    if (!deliveredShipments.length && !loading) {
      console.log(
        "🔍 DeliveredShipmentsComponent: Fetching delivered shipments data"
      );
      dispatch(fetchDeliveredShipments());
    } else if (deliveredShipments.length) {
      console.log(
        "📦 DeliveredShipmentsComponent: Using existing delivered shipments data"
      );
    }
  }, [dispatch, deliveredShipments.length, loading]);

  if (loading) return <div>Loading delivered shipments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Delivered Shipments</h2>
      {deliveredShipments.map((shipment) => (
        <div key={shipment._id}>
          <h3>{shipment.shipmentTitle}</h3>
          <p>Status: {shipment.status}</p>
          <p>Rating: {shipment.rating || "Not rated"}</p>
        </div>
      ))}
    </div>
  );
};

// Example 5: Component that needs to refresh data after an action
const ShipmentActionsComponent = () => {
  const dispatch = useDispatch();
  const { shipments, loading } = useSelector((state) => state.shipment);

  // Force refresh after actions
  const { data: shipmentsData } = useUserShipments();

  const handleUpdateShipment = async (shipmentId, newStatus) => {
    try {
      // Update shipment status
      await dispatch(
        updateShipmentStatus({ id: shipmentId, status: newStatus })
      );

      // Force refresh the shipments list
      console.log("🔄 Refreshing shipments after update");
      dispatch(fetchUserShipments());
    } catch (error) {
      console.error("Failed to update shipment:", error);
    }
  };

  return (
    <div>
      <h2>Shipment Actions</h2>
      {shipments.map((shipment) => (
        <div key={shipment._id}>
          <h3>{shipment.shipmentTitle}</h3>
          <p>Status: {shipment.status}</p>
          <button
            onClick={() => handleUpdateShipment(shipment._id, "completed")}
            disabled={loading}
          >
            Mark Complete
          </button>
        </div>
      ))}
    </div>
  );
};

// Example 6: Component with conditional fetching
const ConditionalDataComponent = ({ userId, shouldFetch }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Only fetch if conditions are met
  useEffect(() => {
    if (shouldFetch && userId && !user && !loading) {
      console.log("🔍 ConditionalDataComponent: Fetching profile data");
      dispatch(fetchProfile());
    }
  }, [dispatch, shouldFetch, userId, user, loading]);

  if (!shouldFetch) {
    return <div>Fetching disabled</div>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Conditional Data</h2>
      <p>User: {user?.name || "No user data"}</p>
    </div>
  );
};

// Example 7: Component with debounced search
const SearchComponent = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { shipments, loading } = useSelector((state) => state.shipment);

  // Debounced search - only search after user stops typing
  useEffect(() => {
    if (searchTerm.length > 2) {
      const timeoutId = setTimeout(() => {
        console.log("🔍 SearchComponent: Searching for:", searchTerm);
        // dispatch(searchShipments(searchTerm));
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  return (
    <div>
      <h2>Search Shipments</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search shipments..."
      />
      {loading && <div>Searching...</div>}
      {shipments.map((shipment) => (
        <div key={shipment._id}>
          <h3>{shipment.shipmentTitle}</h3>
        </div>
      ))}
    </div>
  );
};

export {
  ProfileComponent,
  SettingsComponent,
  ShipmentsDashboard,
  DeliveredShipmentsComponent,
  ShipmentActionsComponent,
  ConditionalDataComponent,
  SearchComponent,
};
