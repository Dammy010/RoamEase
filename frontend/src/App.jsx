import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect } from 'react';
import { initSocket, getSocket, initializeSocketAfterLogin } from './services/socket';

// New: Import Sidebar
import Sidebar from './components/shared/Sidebar';
import Navbar from './components/shared/Navbar';

// Public Pages
import LandingPage from './pages/LandingPage';
import BrowseShipmentsPage from './pages/BrowseShipmentsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import EmailVerifyNotice from './pages/EmailVerifyNotice';
import EmailVerificationPage from './pages/EmailVerificationPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import HelpCenterPage from './pages/HelpCenterPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import FAQPage from './pages/FAQPage';
import ProtectedRoute from './components/shared/ProtectedRoute';

// User Dashboard Pages
import UserDashboardHome from './pages/UserDashboard/DashboardHome';
import PostShipment from './pages/UserDashboard/PostShipment';
import MyShipments from './pages/UserDashboard/MyShipments';
import ChatLogistics from './pages/UserDashboard/ChatLogistics';
import ShipmentHistory from './pages/UserDashboard/ShipmentHistory';
import UserProfile from './pages/UserDashboard/Profile';
import ShipmentDetail from './pages/UserDashboard/ShipmentDetail';
import AcceptRejectBidPage from './pages/UserDashboard/AcceptRejectBidPage'; // New: Import AcceptRejectBidPage
import UserManageBidsPage from './pages/UserDashboard/UserManageBidsPage'; // New: Import UserManageBidsPage
import DeliverShipmentPage from './pages/UserDashboard/DeliverShipmentPage'; // New: Import DeliverShipmentPage
import RateShipment from './pages/UserDashboard/RateShipment'; // New: Import RateShipment
import DeliveredShipments from './pages/UserDashboard/DeliveredShipments'; // New: Import DeliveredShipments

// Logistics Dashboard Pages
import LogisticsDashboardHome from './pages/LogisticsDashboard/DashboardHome';
import Subscriptions from './pages/LogisticsDashboard/Subscriptions';
import UploadDocuments from './pages/LogisticsDashboard/UploadDocuments';
import AvailableShipments from './pages/LogisticsDashboard/AvailableShipments';
import ActiveShipments from './pages/LogisticsDashboard/ActiveShipments';
import MyBids from './pages/LogisticsDashboard/MyBids';
import LogisticsHistory from './pages/LogisticsDashboard/LogisticsHistory';
import ChatWithUsers from './pages/LogisticsDashboard/ChatWithUsers';
import LogisticsProfile from './pages/LogisticsDashboard/Profile';

// Admin Dashboard Pages
import AdminDashboardHome from './pages/AdminDashboard/DashboardHome';
import PendingLogisticsList from './pages/AdminDashboard/PendingLogisticsList';
import VerifiedLogisticsList from './pages/AdminDashboard/VerifiedLogisticsList';
import ShipmentsList from './pages/AdminDashboard/ShipmentsList';
import BidsList from './pages/AdminDashboard/BidsList';
import AdminChatList from './pages/AdminDashboard/AdminChatList';
import AdminChatWindow from './pages/AdminDashboard/AdminChatWindow';
import AdminChatDashboard from './pages/AdminDashboard/AdminChatDashboard';
import ReportsDisputes from './pages/AdminDashboard/ReportsDisputes';
import PlatformAnalytics from './pages/AdminDashboard/PlatformAnalytics';
import AdminProfile from './pages/AdminDashboard/Profile';
import AllUsersListPage from './pages/AdminDashboard/AllUsersListPage';
import NormalUsers from './pages/AdminDashboard/NormalUsers';
import NotificationPage from './pages/NotificationPage';

function App() {
  const { user } = useSelector((state) => state.auth);

  console.log('App.jsx - Current User State:', user);

  useEffect(() => {
    if (user) {
      const socket = initializeSocketAfterLogin();
      if (socket) {
        socket.connect();
        socket.emit('user-online', user._id);
        console.log('Socket connected and user-online emitted:', user._id);
      } else {
        console.log('Socket initialization failed - no valid token');
      }
    } else {
      // User logged out, disconnect socket
      const socket = getSocket();
      if (socket) {
        socket.disconnect();
        console.log('Socket disconnected - user logged out');
      }
    }

    return () => {
      // Clean up on component unmount (e.g., when the app closes or user logs out)
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.disconnect();
        console.log('Socket disconnected on component unmount');
      }
    };
  }, [user]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex h-screen">
        {user ? (
          <>
            <Sidebar role={user.role} />
            <div className="flex-1 ml-48">
              <Routes>
                {/* User Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                  <Route path="/user/dashboard" element={<UserDashboardHome />} />
                  <Route path="/user/post-shipment" element={<PostShipment />} />
                  <Route path="/user/my-shipments" element={<MyShipments />} />
                  <Route path="/user/my-shipments/:id" element={<ShipmentDetail />} />
                  <Route path="/user/manage-bids/:shipmentId" element={<AcceptRejectBidPage />} /> {/* New: Route for bid management page (per shipment) */}
                  <Route path="/user/manage-bids" element={<UserManageBidsPage />} /> {/* New: Route for consolidated bid management page */}
                  <Route path="/user/chat" element={<ChatLogistics />} />
                  <Route path="/user/chat/:conversationId" element={<ChatLogistics />} />
                  <Route path="/user/shipment-history" element={<ShipmentHistory />} />
                  <Route path="/user/delivered-shipments" element={<DeliveredShipments />} /> {/* New: Route for confirming delivered shipments */}
                  <Route path="/user/rate-shipment" element={<RateShipment />} /> {/* New: Route for rating completed shipments */}
                  <Route path="/user/profile" element={<UserProfile />} />
                  <Route path="/user/deliver-shipment/:shipmentId" element={<DeliverShipmentPage />} /> {/* New: Route for marking shipment as delivered and rating */}
                </Route>

                {/* Logistics Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['logistics']} />}>
                  <Route path="/logistics/dashboard" element={<LogisticsDashboardHome />} />
                  <Route path="/logistics/subscriptions" element={<Subscriptions />} />
                  <Route path="/logistics/upload-documents" element={<UploadDocuments />} />
                  <Route path="/logistics/available-shipments" element={<AvailableShipments />} />
                  <Route path="/logistics/active-shipments" element={<ActiveShipments />} />
                  <Route path="/logistics/my-bids" element={<MyBids />} />
                  <Route path="/logistics/history" element={<LogisticsHistory />} />
                  <Route path="/logistics/chat" element={<ChatWithUsers />} />
                  <Route path="/logistics/profile" element={<LogisticsProfile />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardHome />} />
                  <Route path="/admin/users/total" element={<AllUsersListPage />} />
                  <Route path="/admin/users/normal-count" element={<NormalUsers />} />
                  <Route path="/admin/logistics-list" element={<VerifiedLogisticsList />} />
                  <Route path="/admin/verify-logistics" element={<PendingLogisticsList />} />
                  <Route path="/admin/shipments-list" element={<ShipmentsList />} />
                  <Route path="/admin/bids-list" element={<BidsList />} />
                  <Route path="/admin/chat" element={<AdminChatDashboard />} />
                  <Route path="/admin/chat/:conversationId" element={<AdminChatDashboard />} />
                  <Route path="/admin/reports-disputes" element={<ReportsDisputes />} />
                  <Route path="/admin/platform-analytics" element={<PlatformAnalytics />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* Common notification route for all authenticated users */}
                <Route element={<ProtectedRoute allowedRoles={['user', 'logistics', 'admin']} />}>
                  <Route path="/notifications" element={<NotificationPage />} />
                </Route>

                {/* Catch-all for authenticated users to redirect to their dashboard */}
                <Route path="*" element={<Navigate to={`/${user.role}/dashboard`} replace />} />
              </Routes>
            </div>
          </>
        ) : (
          <div className="flex flex-col flex-1">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <Routes>
                {/* Public Routes - Always Accessible */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/browse-shipments" element={<BrowseShipmentsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/verify-notice" element={<EmailVerifyNotice />} />
                <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Catch-all for public users */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
