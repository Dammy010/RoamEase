import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { getSocket } from "../../services/socket";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Navigation,
  Clock,
  Gauge,
  Phone,
  Mail,
  Truck,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom truck icon for driver
const truckIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8H20V20H4V8Z" fill="#3B82F6"/>
      <path d="M20 12H24V16H20V12Z" fill="#1D4ED8"/>
      <circle cx="8" cy="22" r="2" fill="#1F2937"/>
      <circle cx="24" cy="22" r="2" fill="#1F2937"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle map updates
function MapUpdater({ center, zoom, followDriver }) {
  const map = useMap();

  useEffect(() => {
    if (followDriver && center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, followDriver]);

  return null;
}

const ShipmentTracking = ({ shipmentId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [logisticsCompany, setLogisticsCompany] = useState(null);
  const [eta, setEta] = useState(null);
  const [followDriver, setFollowDriver] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const socket = useRef(null);
  const mapRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socket.current = getSocket();
    if (!socket.current) {
      setError("Unable to connect to tracking service");
      setIsLoading(false);
      return;
    }

    // Join shipment tracking room
    socket.current.emit("join-shipment-tracking", shipmentId);

    // Listen for tracking events
    socket.current.on("tracking-status", (data) => {
      setIsTrackingActive(data.isTrackingActive);
      setLastLocation(data.lastLocation);
    });

    socket.current.on("locationUpdate", (data) => {
      if (data.shipmentId === shipmentId) {
        setLastLocation(data.location);
        setLocationHistory((prev) => [...prev, data.location]);
      }
    });

    socket.current.on("trackingStarted", (data) => {
      if (data.shipmentId === shipmentId) {
        setIsTrackingActive(true);
        toast.success("Tracking started");
      }
    });

    socket.current.on("trackingStopped", (data) => {
      if (data.shipmentId === shipmentId) {
        setIsTrackingActive(false);
        toast.info("Tracking stopped");
      }
    });

    socket.current.on("tracking-error", (data) => {
      setError(data.message);
      toast.error(data.message);
    });

    return () => {
      if (socket.current) {
        socket.current.emit("leave-shipment-tracking", shipmentId);
      }
    };
  }, [shipmentId]);

  // Load initial tracking data
  useEffect(() => {
    const loadTrackingData = async () => {
      try {
        const response = await api.get(`/shipments/${shipmentId}/tracking`);
        if (response.data.success) {
          const data = response.data.tracking;
          setTrackingData(data);
          setIsTrackingActive(data.isTrackingActive);
          setLastLocation(data.lastLocation);
          setLocationHistory(data.locationHistory || []);
          setLogisticsCompany(data.logisticsCompany);
          setEta(data.eta);
        }
      } catch (error) {
        console.error("Error loading tracking data:", error);
        setError("Failed to load tracking data");
        toast.error("Failed to load tracking data");
      } finally {
        setIsLoading(false);
      }
    };

    loadTrackingData();
  }, [shipmentId]);

  // Start tracking
  const startTracking = async () => {
    try {
      await api.post(`/shipments/${shipmentId}/start-tracking`);
      toast.success("Tracking started successfully");
    } catch (error) {
      console.error("Error starting tracking:", error);
      toast.error("Failed to start tracking");
    }
  };

  // Stop tracking
  const stopTracking = async () => {
    try {
      await api.post(`/shipments/${shipmentId}/stop-tracking`);
      toast.success("Tracking stopped successfully");
    } catch (error) {
      console.error("Error stopping tracking:", error);
      toast.error("Failed to stop tracking");
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    // If it's today, show time with "ago" format
    if (diffInMinutes < 1440) {
      // Less than 24 hours
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    }

    // If it's older, show date and time
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Copy tracking link
  const copyTrackingLink = async () => {
    try {
      const trackingUrl = `${window.location.origin}/track/${shipmentId}`;
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      toast.success("Tracking link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    }
  };

  // Format speed
  const formatSpeed = (speed) => {
    if (!speed) return "0 km/h";
    return `${Math.round(speed)} km/h`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 sm:ml-3 text-gray-600 text-sm sm:text-base">
              Loading tracking data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl sm:text-6xl mb-3 sm:mb-4">
              ⚠️
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Tracking Error
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default to a safe location (London) if no location data
  const mapCenter =
    lastLocation && lastLocation.lat && lastLocation.lng
      ? [lastLocation.lat, lastLocation.lng]
      : [51.5074, -0.1278]; // London coordinates as fallback
  const mapZoom = lastLocation && lastLocation.lat && lastLocation.lng ? 13 : 2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full h-[95vh] sm:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Shipment Tracking
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Real-time location updates
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
            <button
              onClick={copyTrackingLink}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
            >
              {copied ? (
                <Check size={14} className="sm:w-4 sm:h-4" />
              ) : (
                <Copy size={14} className="sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied!" : "Copy Link"}
              </span>
              <span className="sm:hidden">{copied ? "✓" : "📋"}</span>
            </button>
            <button
              onClick={() => setFollowDriver(!followDriver)}
              className={`p-1.5 sm:p-2 rounded-lg ${
                followDriver
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
              title={followDriver ? "Stop following driver" : "Follow driver"}
            >
              {followDriver ? (
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Map */}
          <div className="flex-1 relative h-64 sm:h-80 lg:h-full">
            {mapCenter && mapCenter[0] && mapCenter[1] ? (
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="h-full w-full"
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapUpdater
                  center={mapCenter}
                  zoom={mapZoom}
                  followDriver={followDriver}
                />

                {/* Driver marker */}
                {lastLocation && lastLocation.lat && lastLocation.lng && (
                  <Marker
                    position={[lastLocation.lat, lastLocation.lng]}
                    icon={truckIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm sm:text-base">
                          Driver Location
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {lastLocation.address}
                        </p>
                        <p className="text-xs sm:text-sm">
                          Speed: {formatSpeed(lastLocation.speed)}
                        </p>
                        <p className="text-xs sm:text-sm">
                          Last update: {formatTime(lastLocation.timestamp)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route polyline */}
                {locationHistory.length > 1 && (
                  <Polyline
                    positions={locationHistory
                      .filter((loc) => loc.lat && loc.lng)
                      .map((loc) => [loc.lat, loc.lng])}
                    color="#3B82F6"
                    weight={3}
                    opacity={0.7}
                  />
                )}
              </MapContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Loading map...
                  </p>
                </div>
              </div>
            )}

            {/* Map overlay controls */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-lg shadow-lg p-2 sm:p-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    isTrackingActive ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs sm:text-sm font-medium">
                  {isTrackingActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l flex flex-col overflow-y-auto h-64 sm:h-80 lg:h-full">
            {/* Driver Info */}
            <div className="p-3 sm:p-4 border-b">
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                Driver Information
              </h3>
              {logisticsCompany ? (
                <div className="space-y-2 sm:space-y-3">
                  {/* Driver Name & Company */}
                  <div className="flex items-center space-x-2">
                    <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {logisticsCompany.name || "Driver"}
                      </p>
                      {logisticsCompany.companyName && (
                        <p className="text-xs text-gray-500">
                          {logisticsCompany.companyName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-1 sm:space-y-2">
                    {logisticsCompany.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                        <a
                          href={`tel:${logisticsCompany.phone}`}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                        >
                          {logisticsCompany.phone}
                        </a>
                      </div>
                    )}

                    {logisticsCompany.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                        <a
                          href={`mailto:${logisticsCompany.email}`}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 truncate"
                        >
                          {logisticsCompany.email}
                        </a>
                      </div>
                    )}

                    {logisticsCompany.address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {logisticsCompany.address}
                        </span>
                      </div>
                    )}

                    {logisticsCompany.country && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                        <span className="text-xs sm:text-sm text-gray-600">
                          {logisticsCompany.country}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {logisticsCompany.bio && (
                    <div className="mt-2 sm:mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 italic line-clamp-3">
                        "{logisticsCompany.bio}"
                      </p>
                    </div>
                  )}

                  {/* Online Status */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        logisticsCompany.isOnline
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {logisticsCompany.isOnline
                        ? "Online"
                        : `Last seen ${new Date(
                            logisticsCompany.lastSeen
                          ).toLocaleTimeString()}`}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">
                  No driver assigned
                </p>
              )}
            </div>

            {/* Current Status */}
            <div className="p-3 sm:p-4 border-b">
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                Current Status
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Status
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isTrackingActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isTrackingActive ? "In Transit" : "Stopped"}
                  </span>
                </div>

                {lastLocation && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Speed
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {formatSpeed(lastLocation.speed)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Last Update
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {formatTime(lastLocation.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        ETA
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {eta || "Not specified"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Location History */}
            <div className="flex-1 p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                Location History
              </h3>
              {locationHistory.length > 0 ? (
                <div className="space-y-1 sm:space-y-2">
                  {locationHistory
                    .slice(-10)
                    .reverse()
                    .map((location, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-2 sm:p-3 border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium">
                            {formatTime(location.timestamp)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatSpeed(location.speed)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {location.address}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">
                  No location history available
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="p-3 sm:p-4 border-t">
              <div className="flex space-x-1 sm:space-x-2">
                {isTrackingActive ? (
                  <button
                    onClick={stopTracking}
                    className="flex-1 bg-red-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  >
                    <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Stop Tracking</span>
                    <span className="sm:hidden">Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={startTracking}
                    className="flex-1 bg-green-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Start Tracking</span>
                    <span className="sm:hidden">Start</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracking;
