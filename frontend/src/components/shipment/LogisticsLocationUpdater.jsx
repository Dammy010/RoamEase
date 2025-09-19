import React, { useState, useEffect, useRef } from "react";
import { useShipmentTracking } from "../../hooks/useShipmentTracking";
import { MapPin, Navigation, Clock, Wifi, WifiOff } from "lucide-react";
import { toast } from "react-hot-toast";

const LogisticsLocationUpdater = ({ shipmentId }) => {
  const {
    isTrackingActive,
    lastLocation,
    isConnected,
    updateLocation,
    startTracking,
    stopTracking,
  } = useShipmentTracking(shipmentId);

  const [isUpdating, setIsUpdating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          speed: currentSpeed,
          heading: currentHeading,
        } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setSpeed(currentSpeed || 0);
        setHeading(currentHeading || 0);
        setIsUpdating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get current location");
        setIsUpdating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Start watching location
  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const {
          latitude,
          longitude,
          speed: currentSpeed,
          heading: currentHeading,
        } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setSpeed(currentSpeed || 0);
        setHeading(currentHeading || 0);
      },
      (error) => {
        console.error("Error watching location:", error);
        toast.error("Failed to watch location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  };

  // Stop watching location
  const stopWatchingLocation = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Update location
  const handleUpdateLocation = async () => {
    if (!currentLocation) {
      toast.error("No location available");
      return;
    }

    try {
      await updateLocation({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        speed: speed,
        heading: heading,
      });
      toast.success("Location updated successfully");
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    }
  };

  // Auto-update location when tracking is active
  useEffect(() => {
    if (isTrackingActive) {
      startWatchingLocation();
    } else {
      stopWatchingLocation();
    }

    return () => {
      stopWatchingLocation();
    };
  }, [isTrackingActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatchingLocation();
    };
  }, []);

  const formatSpeed = (speed) => {
    if (!speed) return "0 km/h";
    return `${Math.round(speed * 3.6)} km/h`;
  };

  const formatHeading = (heading) => {
    if (heading === null || heading === undefined) return "Unknown";
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return `${Math.round(heading)}° ${directions[index]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Location Tracking
        </h3>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Tracking Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Tracking Status
          </span>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isTrackingActive ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium">
              {isTrackingActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isTrackingActive ? (
            <button
              onClick={startTracking}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <Navigation className="h-4 w-4" />
              <span>Start Tracking</span>
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center space-x-2"
            >
              <Navigation className="h-4 w-4" />
              <span>Stop Tracking</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Location */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Current Location
        </h4>

        {currentLocation ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Coordinates</span>
              <span className="text-sm font-mono">
                {currentLocation.lat.toFixed(6)},{" "}
                {currentLocation.lng.toFixed(6)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Speed</span>
              <span className="text-sm font-medium">{formatSpeed(speed)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Heading</span>
              <span className="text-sm font-medium">
                {formatHeading(heading)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No location data available</p>
        )}

        <div className="mt-4 flex space-x-2">
          <button
            onClick={getCurrentLocation}
            disabled={isUpdating}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>
              {isUpdating ? "Getting Location..." : "Get Current Location"}
            </span>
          </button>

          {currentLocation && (
            <button
              onClick={handleUpdateLocation}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <Navigation className="h-4 w-4" />
              <span>Update Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Last Known Location */}
      {lastLocation && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Last Known Location
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Address</span>
              <span className="text-sm text-gray-900">
                {lastLocation.address}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Speed</span>
              <span className="text-sm font-medium">
                {formatSpeed(lastLocation.speed)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Update</span>
              <span className="text-sm font-medium">
                {new Date(lastLocation.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-update Info */}
      {isTrackingActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Location is being automatically updated every 5 seconds
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsLocationUpdater;
