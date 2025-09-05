import React, { useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBidsForShipment, acceptBid, rejectBid } from '../../redux/slices/bidSlice';
import { createConversation, setSelectedConversation } from '../../redux/slices/chatSlice'; // New: Import createConversation
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // New: Import useNavigate

const BidListModal = ({ isOpen, onClose, shipmentId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // New: Initialize useNavigate
  const { bids, loading, error } = useSelector(state => state.bid);
  const { user } = useSelector(state => state.auth); // Get current user for chat initiation

  useEffect(() => {
    if (isOpen && shipmentId) {
      dispatch(fetchBidsForShipment(shipmentId));
    }
  }, [isOpen, shipmentId, dispatch]);

  const handleAcceptBid = async (bidId) => {
    try {
      await dispatch(acceptBid(bidId)).unwrap();
      toast.success('Bid accepted successfully!');
      dispatch(fetchBidsForShipment(shipmentId)); // Refresh bids after action
    } catch (err) {
      toast.error(err);
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await dispatch(rejectBid(bidId)).unwrap();
      toast.success('Bid rejected successfully!');
      dispatch(fetchBidsForShipment(shipmentId)); // Refresh bids after action
    } catch (err) {
      toast.error(err);
    }
  };

  const startChat = async (recipientId, shipmentId) => {
    if (!recipientId) {
      toast.error("Recipient ID is missing to start chat.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to start a chat.");
      return;
    }

    try {
      // Dispatch action to create a new conversation
      const newConversation = await dispatch(createConversation({ recipientId, shipmentId })).unwrap();
      toast.success('Chat initiated successfully!');
      onClose(); // Close the modal
      // Navigate to the chat page with the new conversation ID
      dispatch(setSelectedConversation(newConversation._id)); // Select the new conversation
      navigate(`/user/chat`); // Navigate to the main chat page

    } catch (err) {
      console.error("Failed to create conversation:", err);
      toast.error(err.message || 'Failed to start chat.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bids for Shipment ID: {shipmentId}</h2>
        
        {loading && <p className="text-center text-gray-600">Loading bids...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && bids.length === 0 && (
          <p className="text-center text-gray-600">No bids found for this shipment yet.</p>
        )}

        {!loading && !error && bids.length > 0 && (
          <div className="space-y-4">
            {bids.map(bid => (
              <div key={bid._id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <p className="text-lg font-semibold text-blue-700">Bid Amount: ${bid.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-700 mt-1">ETA: {bid.eta}</p>
                  <p className="text-sm text-gray-600">Message: {bid.message || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-2">By: {bid.carrier?.companyName || bid.carrier?.name || 'Unknown'} ({bid.carrier?.email})</p>
                  <p className={`text-sm font-medium mt-1 ${
                    bid.status === 'accepted' ? 'text-green-600' :
                    bid.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    Status: {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-3 md:mt-0">
                  {bid.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptBid(bid._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-1"
                      >
                        <FaCheckCircle /> Accept
                      </button>
                      <button
                        onClick={() => handleRejectBid(bid._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-1"
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </>
                  )}
                  {/* Show chat button only if not rejected */}
                  {bid.status !== 'rejected' ? (
                    <button
                      onClick={() => startChat(bid.carrier._id, shipmentId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      {bid.status === 'accepted' ? 'Continue Chat' : 'Start Chat'}
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm text-center">
                      Chat not available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidListModal;
