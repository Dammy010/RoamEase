import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Wallet, Clock, MessageSquare, Send } from 'lucide-react';

const BidForm = ({ shipmentId, onSubmit, onCancel }) => {
  const { formatCurrency, parseCurrency, getCurrencySymbol } = useCurrency();
  const [formData, setFormData] = useState({
    price: '',
    eta: '',
    message: '',
    specialConditions: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Allow only numbers, decimal point, and currency symbols
      const cleanValue = value.replace(/[^\d.,]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.price || !formData.eta) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Parse the currency value to get the numeric amount
    const numericPrice = parseCurrency(formData.price);
    
    if (numericPrice <= 0) {
      toast.error('Bid amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        shipmentId,
        price: numericPrice,
        eta: formData.eta,
        message: formData.message,
        specialConditions: formData.specialConditions
      });

      // Reset form
      setFormData({
        price: '',
        eta: '',
        message: '',
        specialConditions: ''
      });

      toast.success('Bid submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-8 h-8 text-green-600" />
        <h3 className="text-xl font-bold text-gray-800">Place Your Bid</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bid Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bid Amount ({getCurrencySymbol()}) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`0.00 (${getCurrencySymbol()})`}
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Enter your competitive bid amount</p>
        </div>

        {/* Estimated Time of Arrival */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Time of Arrival <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="eta"
              value={formData.eta}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 3 days, 24 hours, 1 week"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">How long will it take to complete this shipment?</p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message to Shipper
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your service, experience, or any special considerations..."
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Optional: Add a personal message to stand out</p>
        </div>

        {/* Special Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Conditions
          </label>
          <textarea
            name="specialConditions"
            value={formData.specialConditions}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any special requirements, insurance, or additional services..."
          />
          <p className="text-sm text-gray-500 mt-1">Optional: Specify any special conditions or services</p>
        </div>

        {/* Bid Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Bid Success Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Competitive pricing increases your chances</li>
            <li>• Clear ETA helps shippers plan better</li>
            <li>• Professional messages build trust</li>
            <li>• Highlight your unique advantages</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || !formData.price || !formData.eta}
            className={`px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              loading || !formData.price || !formData.eta
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Bid
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidForm;