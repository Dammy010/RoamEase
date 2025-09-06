import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Bell } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice"; // adjust path if needed
import NotificationBell from "../NotificationBell";

const Sidebar = ({ role }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userLinks = [
    { to: "/user/dashboard", label: "Dashboard Home" },
    { to: "/user/post-shipment", label: "Post Shipment" },
    { to: "/user/my-shipments", label: "My Shipments" },
    { to: "/user/manage-bids", label: "Manage Bids" }, // Updated: Link to consolidated bid management page
    { to: "/user/chat", label: "Chat with Logistics" },
    { to: "/user/delivered-shipments", label: "Delivered Shipments" }, // New: Link to delivered shipments page
    { to: "/user/shipment-history", label: "Shipment History" },
    { to: "/user/rate-shipment", label: "Rate Shipment" },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile" },
    { to: "/settings", label: "Settings" },
  ];

  const logisticsLinks = [
    { to: "/logistics/dashboard", label: "Dashboard Home" },
    { to: "/logistics/subscriptions", label: "Subscriptions" },
    { to: "/logistics/upload-documents", label: "Upload Documents" },
    { to: "/logistics/available-shipments", label: "Available Shipments" },
    { to: "/logistics/active-shipments", label: "Active Shipments" },
    { to: "/logistics/my-bids", label: "My Bids" },
    { to: "/logistics/chat", label: "Chat with Users" },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile" },
    { to: "/settings", label: "Settings" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard Home" },
    { to: "/admin/logistics-list", label: "Verified Logistics" },
    { to: "/admin/verify-logistics", label: "Pending Logistics" },
    { to: "/admin/shipments-list", label: "All Shipments" },
    { to: "/admin/bids-list", label: "All Bids" },
    { to: "/admin/chat", label: "Chat Management" },
    { to: "/admin/reports-disputes", label: "Reports & Disputes" },
    { to: "/admin/platform-analytics", label: "Platform Analytics" },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile" },
    { to: "/settings", label: "Settings" },
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
      <aside className="hidden md:flex flex-col w-48 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 shadow-lg fixed top-0 left-0 z-30">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wide">
            {role.charAt(0).toUpperCase() + role.slice(1)} Panel
          </h2>
          <NotificationBell />
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {link.label}
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
        className={`fixed md:hidden top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-lg transform transition-transform duration-300 z-40 pt-16
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {link.label}
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
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">
              Do you really want to log out of your account?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
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
