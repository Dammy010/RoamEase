import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "../services/socket";
import api from "../services/api";
import { toast } from "react-hot-toast";

export const useShipmentTracking = (shipmentId) => {
  const [trackingData, setTrackingData] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [logisticsCompany, setLogisticsCompany] = useState(null);
  const [eta, setEta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const socket = useRef(null);
  const reconnectTimeout = useRef(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socket.current) {
      return socket.current;
    }

    const newSocket = getSocket();
    if (!newSocket) {
      setError("Unable to connect to tracking service");
      setIsLoading(false);
      return null;
    }

    socket.current = newSocket;
    return newSocket;
  }, []);

  // Join tracking room
  const joinTrackingRoom = useCallback(
    (socketInstance) => {
      if (!socketInstance || !shipmentId) return;

      socketInstance.emit("join-shipment-tracking", shipmentId);
      setIsConnected(true);
    },
    [shipmentId]
  );

  // Setup socket event listeners
  const setupSocketListeners = useCallback(
    (socketInstance) => {
      if (!socketInstance) return;

      // Tracking status updates
      socketInstance.on("tracking-status", (data) => {
        setIsTrackingActive(data.isTrackingActive);
        setLastLocation(data.lastLocation);
      });

      // Real-time location updates
      socketInstance.on("locationUpdate", (data) => {
        if (data.shipmentId === shipmentId) {
          setLastLocation(data.location);
          setLocationHistory((prev) => [...prev, data.location]);
        }
      });

      // Tracking started
      socketInstance.on("trackingStarted", (data) => {
        if (data.shipmentId === shipmentId) {
          setIsTrackingActive(true);
          toast.success("Tracking started");
        }
      });

      // Tracking stopped
      socketInstance.on("trackingStopped", (data) => {
        if (data.shipmentId === shipmentId) {
          setIsTrackingActive(false);
          toast.info("Tracking stopped");
        }
      });

      // Tracking errors
      socketInstance.on("tracking-error", (data) => {
        setError(data.message);
        toast.error(data.message);
      });

      // Connection events
      socketInstance.on("connect", () => {
        setIsConnected(true);
        joinTrackingRoom(socketInstance);
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);

        // Auto-reconnect after 3 seconds
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }

        reconnectTimeout.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          initializeSocket();
        }, 3000);
      });
    },
    [shipmentId, joinTrackingRoom, initializeSocket]
  );

  // Load initial tracking data
  const loadTrackingData = useCallback(async () => {
    try {
      const response = await api.get(`/shipments/${shipmentId}/tracking`);
      console.log("🔍 Tracking API response:", response.data);

      if (response.data.success) {
        const data = response.data.tracking;
        console.log("🔍 Tracking data:", data);
        console.log("🔍 Logistics company:", data.logisticsCompany);

        setTrackingData(data);
        setIsTrackingActive(data.isTrackingActive);
        setLastLocation(data.lastLocation);
        setLocationHistory(data.locationHistory || []);
        setLogisticsCompany(data.logisticsCompany);
        setEta(data.eta);
        setError(null);
      }
    } catch (error) {
      console.error("Error loading tracking data:", error);
      setError("Failed to load tracking data");
      toast.error("Failed to load tracking data");
    } finally {
      setIsLoading(false);
    }
  }, [shipmentId]);

  // Start tracking
  const startTracking = useCallback(async () => {
    try {
      await api.post(`/shipments/${shipmentId}/start-tracking`);
      toast.success("Tracking started successfully");
    } catch (error) {
      console.error("Error starting tracking:", error);
      toast.error("Failed to start tracking");
    }
  }, [shipmentId]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    try {
      await api.post(`/shipments/${shipmentId}/stop-tracking`);
      toast.success("Tracking stopped successfully");
    } catch (error) {
      console.error("Error stopping tracking:", error);
      toast.error("Failed to stop tracking");
    }
  }, [shipmentId]);

  // Update location (for logistics companies)
  const updateLocation = useCallback(
    async (locationData) => {
      try {
        await api.post(`/shipments/${shipmentId}/location`, locationData);
      } catch (error) {
        console.error("Error updating location:", error);
        toast.error("Failed to update location");
      }
    },
    [shipmentId]
  );

  // Initialize tracking
  useEffect(() => {
    if (!shipmentId) return;

    const initialize = async () => {
      await loadTrackingData();

      const socketInstance = initializeSocket();
      if (socketInstance) {
        setupSocketListeners(socketInstance);
        joinTrackingRoom(socketInstance);
      }
    };

    initialize();

    return () => {
      if (socket.current) {
        socket.current.emit("leave-shipment-tracking", shipmentId);
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [
    shipmentId,
    loadTrackingData,
    initializeSocket,
    setupSocketListeners,
    joinTrackingRoom,
  ]);

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!isConnected && socket.current) {
      const timeout = setTimeout(() => {
        console.log("Attempting to reconnect...");
        const newSocket = initializeSocket();
        if (newSocket) {
          setupSocketListeners(newSocket);
          joinTrackingRoom(newSocket);
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isConnected, initializeSocket, setupSocketListeners, joinTrackingRoom]);

  return {
    trackingData,
    isTrackingActive,
    lastLocation,
    locationHistory,
    logisticsCompany,
    eta,
    isLoading,
    error,
    isConnected,
    startTracking,
    stopTracking,
    updateLocation,
    refreshData: loadTrackingData,
  };
};
