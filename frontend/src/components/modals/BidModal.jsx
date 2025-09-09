import React from 'react';
import { FaTimes } from 'react-icons/fa';

const BidModal = ({ isOpen, onClose, onSubmit, shipment, bidDetails, setBidDetails }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBidDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Submit Bid for Shipment</h2>
        
        {shipment && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800">{shipment.shipmentTitle}</h3>
            <p className="text-sm text-blue-700">From: {shipment.pickupCity} to {shipment.deliveryCity}</p>
            <p className="text-sm text-blue-700">Weight: {shipment.weightSummary}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Bid Price (USD)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={bidDetails.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 250.00"
              required
              min="0"
            />
          </div>
          <div>
            <label htmlFor="eta" className="block text-sm font-medium text-gray-700">Estimated Time of Arrival (ETA)</label>
            <input
              type="text"
              id="eta"
              name="eta"
              value={bidDetails.eta}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 3 days, 24 hours"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={bidDetails.message}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes or details about your bid..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal;

