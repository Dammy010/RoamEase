import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardData,
  deleteUser,
  suspendUser,
} from "../../redux/slices/adminSlice";
import { toast } from "react-toastify";
import UserEditModal from "../../components/shared/UserEditModal";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";
import {
  Users,
  Search,
  Filter,
  SortAsc,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Plus,
  Settings,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Award,
  Star,
  Globe,
  FileText,
  TrendingUp,
  Activity,
} from "lucide-react";

const NormalUsers = () => {
  const dispatch = useDispatch();
  // We use the `users` array from fetchDashboardData and filter for normal users
  const { users, loading, error } = useSelector((state) => state.admin);
  const normalUsers = users.filter((user) => user.role === "user");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);

  // Confirmation dialog states
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showSuspendConfirmDialog, setShowSuspendConfirmDialog] =
    useState(false);
  const [pendingActionData, setPendingActionData] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardData()); // Fetch all users
  }, [dispatch]);

  const handleDeleteUser = async (userId) => {
    setPendingActionData({ userId, action: "delete" });
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!pendingActionData) return;
    await dispatch(deleteUser(pendingActionData.userId));
    setShowDeleteConfirmDialog(false);
    setPendingActionData(null);
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    setPendingActionData({ userId, newStatus, action: "suspend" });
    setShowSuspendConfirmDialog(true);
  };

  const confirmSuspendUser = async () => {
    if (!pendingActionData) return;
    await dispatch(
      suspendUser({
        userId: pendingActionData.userId,
        newStatus: pendingActionData.newStatus,
      })
    );
    setShowSuspendConfirmDialog(false);
    setPendingActionData(null);
  };

  const handleEditUser = (user) => {
    setCurrentUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
  };

  if (loading) return <p className="p-4">Loading normal users...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Normal Users (Shipment Posters)
      </h2>

      {normalUsers.length === 0 ? (
        <p className="text-gray-500">No normal users registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left border-r">#</th>
                <th className="py-2 px-4 text-left border-r">Name</th>
                <th className="py-2 px-4 text-left border-r">Email</th>
                <th className="py-2 px-4 text-left border-r">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {normalUsers.map((user, idx) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 border-r">{idx + 1}</td>
                  <td className="py-2 px-4 border-r">{user.name}</td>
                  <td className="py-2 px-4 border-r">{user.email}</td>
                  <td className="py-2 px-4 border-r">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.isActive === false
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.isActive === false ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex space-x-2">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        handleSuspendUser(
                          user._id,
                          user.isActive ? "active" : "suspended"
                        )
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        user.isActive === false
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-gray-500 hover:bg-gray-600 text-white"
                      }`}
                    >
                      {user.isActive === false ? "Activate" : "Suspend"}
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditModalOpen && (
        <UserEditModal
          user={currentUserToEdit}
          onClose={handleCloseEditModal}
          onSave={(updatedUser) => {
            // Dispatch update user action
            handleCloseEditModal();
          }}
        />
      )}

      {/* Modern Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmDialog}
        onClose={() => {
          setShowDeleteConfirmDialog(false);
          setPendingActionData(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationDialog
        isOpen={showSuspendConfirmDialog}
        onClose={() => {
          setShowSuspendConfirmDialog(false);
          setPendingActionData(null);
        }}
        onConfirm={confirmSuspendUser}
        title={`${
          pendingActionData?.newStatus === "suspended" ? "Suspend" : "Activate"
        } User`}
        message={`Are you sure you want to ${pendingActionData?.newStatus} this user?`}
        confirmText={
          pendingActionData?.newStatus === "suspended" ? "Suspend" : "Activate"
        }
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default NormalUsers;
