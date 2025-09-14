import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, LogOut, Bell, Home, MessageSquare, Package, 
  History, Star, User, Settings, CreditCard, Truck, 
  BarChart3, Users, FileText, Shield, TrendingUp
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice"; // adjust path if needed
import { markBidsAsViewed } from "../../redux/slices/bidSlice";
import { clearDeliveredShipmentsCount } from "../../redux/slices/shipmentSlice";
import NotificationBell from "../NotificationBell";

const Sidebar = ({ role }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get chat unread count from Redux store
  const { unreadCount: chatUnreadCount, conversations } = useSelector((state) => state.chat);
  
  // Get bids count from Redux store (bids on user's shipments)
  const { bids: bidsOnMyShipments, bidsViewed } = useSelector((state) => state.bid);
  
  // Get delivered shipments count from Redux store
  const { deliveredShipments } = useSelector((state) => state.shipment);
  
  // Calculate counts - only show if not viewed
  const bidsCount = (!bidsViewed && bidsOnMyShipments?.length) || 0;
  const deliveredCount = deliveredShipments?.length || 0;
  
  // Debug logging
  console.log('Sidebar - Chat unread count:', chatUnreadCount);
  console.log('Sidebar - Bids count:', bidsCount);
  console.log('Sidebar - Bids viewed:', bidsViewed);
  console.log('Sidebar - Bids array length:', bidsOnMyShipments?.length);
  console.log('Sidebar - Delivered shipments count:', deliveredCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleManageBidsClick = () => {
    // Mark bids as viewed when user clicks on Manage Bids
    console.log('🖱️ Manage Bids clicked - marking as viewed');
    dispatch(markBidsAsViewed());
  };

  const handleDeliveredShipmentsClick = () => {
    // Clear the delivered shipments count when user clicks on Delivered Shipments
    dispatch(clearDeliveredShipmentsCount());
  };

  const userLinks = [
    { to: "/user/dashboard", label: "Dashboard Home", icon: Home },
    { to: "/user/manage-bids", label: "Manage Bids", icon: MessageSquare },
    { to: "/user/chat", label: "Chat with Logistics", icon: MessageSquare },
    { to: "/user/delivered-shipments", label: "Delivered Shipments", icon: Package },
    { to: "/user/shipment-history", label: "Shipment History", icon: History },
    { to: "/user/rate-shipment", label: "Rate Shipment", icon: Star },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const logisticsLinks = [
    { to: "/logistics/dashboard", label: "Dashboard Home", icon: Home },
    { to: "/logistics/subscriptions", label: "Subscriptions", icon: CreditCard },
    { to: "/logistics/history", label: "Delivery History", icon: History },
    { to: "/logistics/ratings", label: "Customer Ratings", icon: Star },
    { to: "/logistics/chat", label: "Chat with Users", icon: MessageSquare },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard Home", icon: Home },
    { to: "/admin/shipments-list", label: "All Shipments", icon: Package },
    { to: "/admin/bids-list", label: "All Bids", icon: MessageSquare },
    { to: "/admin/chat", label: "Chat Management", icon: MessageSquare },
    { to: "/admin/reports", label: "Report Management", icon: FileText },
    { to: "/admin/platform-analytics", label: "Platform Analytics", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const links =
    role === "admin"
      ? adminLinks
      : role === "logistics"
      ? logisticsLinks
      : userLinks;

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white flex justify-between items-center p-4 shadow-lg">
        <h2 className="text-lg font-bold">
          {role.charAt(0).toUpperCase() + role.slice(1)} Panel
        </h2>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desktop Sidebar - Fixed positioning for true stickiness */}
      <aside className="hidden md:flex flex-col w-48 h-screen bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white p-4 shadow-lg fixed top-0 left-0 z-30">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wide">
            {role.charAt(0).toUpperCase() + role.slice(1)} Panel
          </h2>
          <NotificationBell />
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            const IconComponent = link.icon;
            const isChatLink = link.to.includes('/chat');
            const isManageBidsLink = link.to.includes('/manage-bids');
            const isDeliveredShipmentsLink = link.to.includes('/delivered-shipments');
            
            // Determine which count to show
            let showCount = false;
            let countValue = 0;
            
            if (isChatLink && chatUnreadCount > 0) {
              showCount = true;
              countValue = chatUnreadCount;
              countColor = 'bg-red-500';
            } else if (isManageBidsLink && bidsCount > 0) {
              showCount = true;
              countValue = bidsCount;
            } else if (isDeliveredShipmentsLink && deliveredCount > 0) {
              showCount = true;
              countValue = deliveredCount;
            }
            
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={isManageBidsLink ? handleManageBidsClick : isDeliveredShipmentsLink ? handleDeliveredShipmentsClick : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {IconComponent && <IconComponent size={16} />}
                {link.label}
                {showCount && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {countValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Logout button */}
        <button
          onClick={() => setShowConfirm(true)}
          className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-300 font-medium text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Mobile Slide-in Sidebar */}
      <aside
        className={`fixed md:hidden top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white p-6 shadow-lg transform transition-transform duration-300 z-40 pt-16
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            const IconComponent = link.icon;
            const isChatLink = link.to.includes('/chat');
            const isManageBidsLink = link.to.includes('/manage-bids');
            const isDeliveredShipmentsLink = link.to.includes('/delivered-shipments');
            
            // Determine which count to show
            let showCount = false;
            let countValue = 0;
            
            if (isChatLink && chatUnreadCount > 0) {
              showCount = true;
              countValue = chatUnreadCount;
              countColor = 'bg-red-500';
            } else if (isManageBidsLink && bidsCount > 0) {
              showCount = true;
              countValue = bidsCount;
            } else if (isDeliveredShipmentsLink && deliveredCount > 0) {
              showCount = true;
              countValue = deliveredCount;
            }
            
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  setIsOpen(false);
                  if (isManageBidsLink) {
                    handleManageBidsClick();
                  } else if (isDeliveredShipmentsLink) {
                    handleDeliveredShipmentsClick();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {IconComponent && <IconComponent size={16} />}
                {link.label}
                {showCount && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {countValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Mobile Logout */}
        <button
          onClick={() => {
            setIsOpen(false);
            setShowConfirm(true);
          }}
          className="mt-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-300 font-medium w-full"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Are you sure?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Do you really want to log out of your account?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
