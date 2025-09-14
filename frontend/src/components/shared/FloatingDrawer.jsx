import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, LogOut, Bell, Home, MessageSquare, Package, 
  History, Star, User, Settings, CreditCard, Truck, 
  BarChart3, Users, FileText, Shield, TrendingUp, 
  Handshake, Wallet, Gavel
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { markBidsAsViewed } from "../../redux/slices/bidSlice";
import { clearDeliveredShipmentsCount } from "../../redux/slices/shipmentSlice";

const FloatingDrawer = ({ role }) => {
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
  
  // Auto-close drawer when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };
    
    window.addEventListener('resize', handleRouteChange);
    return () => window.removeEventListener('resize', handleRouteChange);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleManageBidsClick = () => {
    console.log('🖱️ Manage Bids clicked - marking as viewed');
    dispatch(markBidsAsViewed());
  };

  const handleDeliveredShipmentsClick = () => {
    dispatch(clearDeliveredShipmentsCount());
  };


  const userLinks = [
    { to: "/user/dashboard", label: "Dashboard", icon: Home, description: "Overview & stats" },
    { to: "/user/manage-bids", label: "Manage Bids", icon: Handshake, description: "Review offers" },
    { to: "/user/chat", label: "Chat", icon: MessageSquare, description: "Talk to logistics" },
    { to: "/user/delivered-shipments", label: "Delivered", icon: Package, description: "Completed orders" },
    { to: "/user/shipment-history", label: "History", icon: History, description: "Past shipments" },
    { to: "/user/rate-shipment", label: "Rate", icon: Star, description: "Rate service" },
    { to: "/reports", label: "Reports", icon: FileText, description: "Issue reports" },
    { to: "/notifications", label: "Notifications", icon: Bell, description: "Alerts & updates" },
    { to: "/profile", label: "Profile", icon: User, description: "Account settings" },
    { to: "/settings", label: "Settings", icon: Settings, description: "Preferences" },
  ];

  const logisticsLinks = [
    { to: "/logistics/dashboard", label: "Dashboard", icon: Home, description: "Overview & stats" },
    { to: "/logistics/subscriptions", label: "Subscriptions", icon: CreditCard, description: "Manage plan" },
    { to: "/logistics/history", label: "History", icon: History, description: "Delivery records" },
    { to: "/logistics/ratings", label: "Ratings", icon: Star, description: "Customer feedback" },
    { to: "/logistics/chat", label: "Chat", icon: MessageSquare, description: "Talk to users" },
    { to: "/reports", label: "Reports", icon: FileText, description: "Issue reports" },
    { to: "/notifications", label: "Notifications", icon: Bell, description: "Alerts & updates" },
    { to: "/profile", label: "Profile", icon: User, description: "Account settings" },
    { to: "/settings", label: "Settings", icon: Settings, description: "Preferences" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: Home, description: "Overview & stats" },
    { to: "/admin/shipments-list", label: "Shipments", icon: Package, description: "All shipments" },
    { to: "/admin/bids-list", label: "Bids", icon: Handshake, description: "All bids" },
    { to: "/admin/chat", label: "Chat", icon: MessageSquare, description: "Chat management" },
    { to: "/admin/reports", label: "Reports", icon: FileText, description: "Report management" },
    { to: "/admin/platform-analytics", label: "Analytics", icon: BarChart3, description: "Platform insights" },
    { to: "/notifications", label: "Notifications", icon: Bell, description: "Alerts & updates" },
    { to: "/profile", label: "Profile", icon: User, description: "Account settings" },
    { to: "/settings", label: "Settings", icon: Settings, description: "Preferences" },
  ];

  const links = role === "admin" ? adminLinks : role === "logistics" ? logisticsLinks : userLinks;

  return (
    <>
      {/* Floating Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>


      {/* Backdrop - Show when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-enter"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Drawer */}
      <div
        className={`fixed top-4 left-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out transform ${
          isOpen 
            ? "translate-x-0 opacity-100 scale-100" 
            : "-translate-x-full opacity-0 scale-95"
        }`}
        style={{
          maxHeight: 'calc(100vh - 2rem)',
          height: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {role.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {role.charAt(0).toUpperCase() + role.slice(1)} Panel
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Navigation Menu
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto drawer-scroll">
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
                className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative drawer-item ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors duration-300 ${
                  isActive 
                    ? "bg-white bg-opacity-20" 
                    : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"
                }`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{link.label}</div>
                  <div className={`text-xs ${
                    isActive 
                      ? "text-white text-opacity-80" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {link.description}
                  </div>
                </div>
                {showCount && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center animate-pulse">
                    {countValue}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 transition-all duration-300 font-medium group"
          >
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-800 group-hover:bg-red-200 dark:group-hover:bg-red-700 transition-colors duration-300">
              <LogOut size={20} />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 backdrop-enter">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-200 dark:border-gray-700 modal-enter">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Are you sure?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Do you really want to log out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
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

export default FloatingDrawer;
