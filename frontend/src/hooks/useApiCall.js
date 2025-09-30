import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

/**
 * Custom hook to prevent duplicate API calls
 * @param {Function} fetchAction - The Redux async thunk action
 * @param {string} dataSelector - Selector to get data from Redux state
 * @param {string} loadingSelector - Selector to get loading state from Redux state
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Additional options
 * @param {boolean} options.forceRefresh - Force refresh even if data exists
 * @param {number} options.debounceMs - Debounce delay in milliseconds
 * @param {boolean} options.enabled - Whether the hook is enabled
 */
export const useApiCall = (
  fetchAction,
  dataSelector,
  loadingSelector,
  dependencies = [],
  options = {}
) => {
  const dispatch = useDispatch();
  const data = useSelector(dataSelector);
  const loading = useSelector(loadingSelector);
  const { forceRefresh = false, debounceMs = 0, enabled = true } = options;

  const timeoutRef = useRef(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) {
      console.log(`🚫 API call disabled for ${fetchAction.typePrefix}`);
      return;
    }

    // Don't fetch if already loading
    if (loading) {
      console.log(`⏳ Already loading ${fetchAction.typePrefix}, skipping`);
      return;
    }

    // Check if we have data and don't need to force refresh
    if (data && !forceRefresh && hasFetchedRef.current) {
      console.log(`📦 Using existing data for ${fetchAction.typePrefix}`);
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const fetchData = () => {
      console.log(`🌐 Fetching data for ${fetchAction.typePrefix}`);
      hasFetchedRef.current = true;
      dispatch(fetchAction());
    };

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(fetchData, debounceMs);
    } else {
      fetchData();
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);

  // Reset hasFetched when dependencies change
  useEffect(() => {
    hasFetchedRef.current = false;
  }, dependencies);

  return { data, loading };
};

/**
 * Hook specifically for profile data with caching
 */
export const useProfile = (forceRefresh = false) => {
  return useApiCall(
    (dispatch) => dispatch(require("../redux/slices/authSlice").fetchProfile()),
    (state) => state.auth.user,
    (state) => state.auth.loading,
    [], // No dependencies - profile doesn't change often
    { forceRefresh }
  );
};

/**
 * Hook specifically for settings data with caching
 */
export const useSettings = (forceRefresh = false) => {
  return useApiCall(
    (dispatch) =>
      dispatch(require("../redux/slices/settingsSlice").getSettings()),
    (state) => state.settings,
    (state) => state.settings.loading,
    [], // No dependencies - settings don't change often
    { forceRefresh }
  );
};

/**
 * Hook specifically for user shipments with caching
 */
export const useUserShipments = (forceRefresh = false) => {
  return useApiCall(
    (dispatch) =>
      dispatch(require("../redux/slices/shipmentSlice").fetchUserShipments()),
    (state) => state.shipment.shipments,
    (state) => state.shipment.loading,
    [], // No dependencies - shipments don't change often
    { forceRefresh }
  );
};

/**
 * Hook specifically for delivered shipments with caching
 */
export const useDeliveredShipments = (forceRefresh = false) => {
  return useApiCall(
    (dispatch) =>
      dispatch(
        require("../redux/slices/shipmentSlice").fetchDeliveredShipments()
      ),
    (state) => state.shipment.deliveredShipments,
    (state) => state.shipment.loading,
    [], // No dependencies - delivered shipments don't change often
    { forceRefresh }
  );
};

/**
 * Hook specifically for available shipments with caching
 */
export const useAvailableShipments = (forceRefresh = false) => {
  return useApiCall(
    (dispatch) =>
      dispatch(
        require("../redux/slices/shipmentSlice").fetchAvailableShipments()
      ),
    (state) => state.shipment.availableShipments,
    (state) => state.shipment.loading,
    [], // No dependencies - available shipments don't change often
    { forceRefresh }
  );
};

/**
 * Hook for shipment by ID with caching
 */
export const useShipmentById = (shipmentId, forceRefresh = false) => {
  return useApiCall(
    (dispatch) =>
      dispatch(
        require("../redux/slices/shipmentSlice").fetchShipmentById(shipmentId)
      ),
    (state) => state.shipment.currentShipment,
    (state) => state.shipment.loading,
    [shipmentId], // Dependencies include shipmentId
    { forceRefresh }
  );
};

/**
 * Hook for debounced search with caching
 */
export const useDebouncedSearch = (
  fetchAction,
  dataSelector,
  loadingSelector,
  searchTerm,
  debounceMs = 300
) => {
  return useApiCall(fetchAction, dataSelector, loadingSelector, [searchTerm], {
    debounceMs,
  });
};

export default useApiCall;
