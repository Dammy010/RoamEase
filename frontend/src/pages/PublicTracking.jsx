import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useParams } from "react-router-dom";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Gauge, 
  User, 
  Phone, 
  Mail, 
  Building, 
  Globe,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PublicTracking = () => {
  const { shipmentId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [logisticsCompany, setLogisticsCompany] = useState(null);
  const [eta, setEta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followDriver, setFollowDriver] = useState(true);
  const [copied, setCopied] = useState(false);

  const mapRef = useRef(null);

  // Load tracking data
  useEffect(() => {
    const loadTrackingData = async () => {
      try {
        const response = await api.get(`/shipments/${shipmentId}/public-tracking`);
        if (response.data.success) {
          const data = response.data.tracking;
          setTrackingData(data);
          setIsTrackingActive(data.isTrackingActive);
          setLastLocation(data.lastLocation);
          setLocationHistory(data.locationHistory || []);
          setLogisticsCompany(data.logisticsCompany);
          setEta(data.eta);
        } else {
          setError(response.data.message || "Failed to load tracking data");
        }
      } catch (error) {
        console.error("Error loading tracking data:", error);
        setError("Failed to load tracking data");
        toast.error("Failed to load tracking data");
      } finally {
        setIsLoading(false);
      }
    };

    if (shipmentId) {
      loadTrackingData();
    }
  }, [shipmentId]);

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

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString();
  };

  // Get map center and zoom
  const getMapCenter = () => {
    if (lastLocation && lastLocation.lat && lastLocation.lng) {
      return [lastLocation.lat, lastLocation.lng];
    }
    return [51.505, -0.09]; // Default to London
  };

  const getMapZoom = () => {
    if (lastLocation && lastLocation.lat && lastLocation.lng) {
      return 13;
    }
    return 2;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const mapCenter = getMapCenter();
  const mapZoom = getMapZoom();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Shipment Tracking
              </h1>
            </div>
            <button
              onClick={copyTrackingLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-96">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Driver marker */}
                {lastLocation && lastLocation.lat && lastLocation.lng && (
                  <Marker position={[lastLocation.lat, lastLocation.lng]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">Driver Location</p>
                        <p className="text-sm text-gray-600">
                          {lastLocation.address || "Location not available"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(lastLocation.timestamp)}
                        </p>
                        {lastLocation.speed && (
                          <p className="text-sm text-blue-600">
                            Speed: {lastLocation.speed} km/h
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route polyline */}
                {locationHistory.length > 1 && (
                  <Polyline
                    positions={locationHistory.map(loc => [loc.lat, loc.lng])}
                    color="#3B82F6"
                    weight={3}
                    opacity={0.7}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Information */}
            {logisticsCompany && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Driver Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{logisticsCompany.name || "Not provided"}</p>
                  </div>
                  {logisticsCompany.companyName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company</p>
                      <p className="text-gray-900">{logisticsCompany.companyName}</p>
                    </div>
                  )}
                  {logisticsCompany.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <a
                        href={`tel:${logisticsCompany.phone}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Phone size={14} />
                        {logisticsCompany.phone}
                      </a>
                    </div>
                  )}
                  {logisticsCompany.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <a
                        href={`mailto:${logisticsCompany.email}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Mail size={14} />
                        {logisticsCompany.email}
                      </a>
                    </div>
                  )}
                  {logisticsCompany.country && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Country</p>
                      <p className="text-gray-900 flex items-center gap-1">
                        <Globe size={14} />
                        {logisticsCompany.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Current Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isTrackingActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {isTrackingActive ? "Tracking Active" : "Not Tracking"}
                  </span>
                </div>
                
                {lastLocation && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Update</span>
                      <span className="text-sm font-medium">
                        {formatTime(lastLocation.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ETA</span>
                      <span className="text-sm font-medium">
                        {eta || "Not specified"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Location History */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={20} />
                Location History
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {locationHistory.length > 0 ? (
                  locationHistory.slice(-10).reverse().map((location, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {location.address || "Unknown location"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(location.timestamp)} at {formatTime(location.timestamp)}
                        </p>
                        {location.speed && (
                          <p className="text-xs text-blue-600">
                            Speed: {location.speed} km/h
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No location history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTracking;
