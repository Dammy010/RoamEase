import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // New: Import useNavigate
import { useTheme } from '../../contexts/ThemeContext';
import { fetchAvailableShipments } from '../../redux/slices/shipmentSlice';
import { createBid } from '../../redux/slices/bidSlice';
import { toast } from 'react-toastify';
import BidModal from '../../components/modals/BidModal';
import { 
  Package, Search, Filter, SortAsc, RefreshCw, MapPin, Calendar, Clock, 
  Truck, Weight, Ruler, Shield, Eye, ChevronDown, ChevronUp, 
  Wallet, MessageSquare, User, Phone, FileText, Image, 
  AlertCircle, CheckCircle, Star, TrendingUp, Globe, Plus
} from 'lucide-react';

const AvailableShipmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // New: Initialize useNavigate
  const { isDark } = useTheme();
  const { availableShipments, loading, error } = useSelector(state => state.shipment);
  const { user } = useSelector(state => state.auth);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [bidDetails, setBidDetails] = useState({ price: '', eta: '', message: '' });

  useEffect(() => {
    if (user?.role === 'logistics') {
      dispatch(fetchAvailableShipments());
    }
  }, [dispatch, user]);

  const openBidModal = (shipment) => {
    setSelectedShipment(shipment);
    setShowBidModal(true);
  };

  const closeBidModal = () => {
    setShowBidModal(false);
    setSelectedShipment(null);
    setBidDetails({ price: '', eta: '', message: '' });
  };

  const handleBidSubmit = async () => {
    if (!selectedShipment || !bidDetails.price || !bidDetails.eta) {
      toast.error('Please enter bid price and ETA.');
      return;
    }
    try {
      const result = await dispatch(createBid({ shipmentId: selectedShipment._id, ...bidDetails })).unwrap();
      toast.success('Bid submitted successfully!');
      closeBidModal();
      dispatch(fetchAvailableShipments()); // Refresh list after bidding

      // New: Navigate to chat if a conversationId is returned
      if (result.conversationId) {
        navigate(`/chat/${result.conversationId}`);
      } else {
        console.warn("No conversationId returned after bid submission.");
      }
    } catch (err) {
      toast.error(err);
    }
  };

  if (loading) return <div className="text-center p-4">Loading available shipments...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Available Shipments for Bidding</h2>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        {availableShipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableShipments.map(shipment => (
              <div key={shipment._id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">{shipment.shipmentTitle}</h3>
                  <p className="text-sm text-gray-700"><span className="font-medium">From:</span> {shipment.pickupAddress}, {shipment.pickupCity}, {shipment.pickupCountry}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">To:</span> {shipment.deliveryAddress}, {shipment.deliveryCity}, {shipment.deliveryCountry}</p>
                  <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Goods:</span> {shipment.descriptionOfGoods} ({shipment.typeOfGoods})</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Weight:</span> {shipment.weightSummary}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Quantity:</span> {shipment.quantitySummary}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Pickup Date:</span> {shipment.formattedPickupDate}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Delivery Date:</span> {shipment.formattedDeliveryDate}</p>
                  <p className="text-xs text-gray-500 mt-3"><span className="font-medium">Posted by:</span> {shipment.user.name || shipment.user.email} (Company: {shipment.user.companyName || 'N/A'})</p>
                </div>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-end text-sm"
                  onClick={() => openBidModal(shipment)}
                >
                  Bid Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No available shipments to display at the moment.</p>
        )}
      </div>
      {showBidModal && (
        <BidModal
          isOpen={showBidModal}
          onClose={closeBidModal}
          onSubmit={handleBidSubmit}
          shipment={selectedShipment}
          bidDetails={bidDetails}
          setBidDetails={setBidDetails}
        />
      )}
    </div>
  );
};

export default AvailableShipmentsPage;
