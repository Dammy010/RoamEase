import React, { useState } from "react";
import ShipmentTracking from "../components/shipment/ShipmentTracking";
import LogisticsLocationUpdater from "../components/shipment/LogisticsLocationUpdater";

const TestTracking = () => {
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [testShipmentId, setTestShipmentId] = useState("");

  // For testing purposes, you can use a sample shipment ID
  // In a real scenario, this would come from your database
  const sampleShipmentId = "507f1f77bcf86cd799439011"; // Example MongoDB ObjectId

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Shipment Tracking Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Shipment Tracking</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipment ID (for testing)
              </label>
              <input
                type="text"
                value={testShipmentId}
                onChange={(e) => setTestShipmentId(e.target.value)}
                placeholder="Enter shipment ID to test tracking"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setTestShipmentId(sampleShipmentId)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Use Sample ID
              </button>
              <button
                onClick={() => setShowTrackingModal(true)}
                disabled={!testShipmentId}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Open Tracking Modal
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Test Location Updater (for Logistics)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipment ID (for testing)
              </label>
              <input
                type="text"
                value={testShipmentId}
                onChange={(e) => setTestShipmentId(e.target.value)}
                placeholder="Enter shipment ID to test location updates"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setTestShipmentId(sampleShipmentId)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Use Sample ID
              </button>
            </div>
            {testShipmentId && (
              <LogisticsLocationUpdater shipmentId={testShipmentId} />
            )}
          </div>
        </div>

        {showTrackingModal && testShipmentId && (
          <ShipmentTracking
            shipmentId={testShipmentId}
            onClose={() => setShowTrackingModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TestTracking;
