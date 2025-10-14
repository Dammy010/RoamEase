import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

const AllUsersListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.admin);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  // Confirmation dialog states
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showQuickUnsuspendConfirmDialog, setShowQuickUnsuspendConfirmDialog] =
    useState(false);
  const [showBulkUnsuspendConfirmDialog, setShowBulkUnsuspendConfirmDialog] =
    useState(false);
  const [pendingActionData, setPendingActionData] = useState(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [currentUserToSuspend, setCurrentUserToSuspend] = useState(null);
  const [suspensionEndDate, setSuspensionEndDate] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDashboardData());
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

  const handleQuickUnsuspend = async (user) => {
    setPendingActionData({ user, action: "unsuspend" });
    setShowQuickUnsuspendConfirmDialog(true);
  };

  const confirmQuickUnsuspend = async () => {
    if (!pendingActionData) return;
    const { user } = pendingActionData;
    await dispatch(
      suspendUser({
        userId: user._id,
        newStatus: "active",
        suspensionEndDate: null,
        suspensionReason: "",
      })
    );
    setShowQuickUnsuspendConfirmDialog(false);
    setPendingActionData(null);
  };

  const handleSuspendUser = (user) => {
    setCurrentUserToSuspend(user);
    setIsSuspendModalOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!currentUserToSuspend) return;

    const newStatus = currentUserToSuspend.isActive ? "suspended" : "active";
    await dispatch(
      suspendUser({
        userId: currentUserToSuspend._id,
        newStatus,
        suspensionEndDate: newStatus === "suspended" ? suspensionEndDate : null,
        suspensionReason: newStatus === "suspended" ? suspensionReason : "",
      })
    );

    setIsSuspendModalOpen(false);
    setCurrentUserToSuspend(null);
    setSuspensionEndDate("");
    setSuspensionReason("");
  };

  const handleCloseSuspendModal = () => {
    setIsSuspendModalOpen(false);
    setCurrentUserToSuspend(null);
    setSuspensionEndDate("");
    setSuspensionReason("");
  };

  const handleQuickSuspend = async (user) => {
    setCurrentUserToSuspend(user);
    setIsSuspendModalOpen(true);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const suspendedUsers = filteredUsers.filter(
      (user) => user.isActive === false
    );
    if (selectedUsers.length === suspendedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(suspendedUsers.map((user) => user._id));
    }
  };

  const handleBulkUnsuspend = async () => {
    if (selectedUsers.length === 0) return;

    const suspendedUsers = filteredUsers.filter(
      (user) => selectedUsers.includes(user._id) && user.isActive === false
    );

    setPendingActionData({ suspendedUsers, action: "bulkUnsuspend" });
    setShowBulkUnsuspendConfirmDialog(true);
  };

  const confirmBulkUnsuspend = async () => {
    if (!pendingActionData) return;

    const { suspendedUsers } = pendingActionData;
    for (const user of suspendedUsers) {
      await dispatch(
        suspendUser({
          userId: user._id,
          newStatus: "active",
          suspensionEndDate: null,
          suspensionReason: "",
        })
      );
    }

    setShowBulkUnsuspendConfirmDialog(false);
    setPendingActionData(null);
    setSelectedUsers([]);
    setShowBulkActions(false);
  };

  const handleEditUser = (user) => {
    setCurrentUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
  };

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && user.isActive !== false) ||
        (filterStatus === "suspended" && user.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = (a.name || a.companyName || "").toLowerCase();
          bValue = (b.name || b.companyName || "").toLowerCase();
          break;
        case "email":
          aValue = (a.email || "").toLowerCase();
          bValue = (b.email || "").toLowerCase();
          break;
        case "role":
          aValue = (a.role || "").toLowerCase();
          bValue = (b.role || "").toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = (a.name || a.companyName || "").toLowerCase();
          bValue = (b.name || b.companyName || "").toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "logistics":
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case "user":
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "logistics":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "user":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Users
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch all registered users...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Error Loading Users
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchDashboardData())}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      All Registered Users
                    </h1>
                    <p className="text-indigo-100 text-base">
                      Manage and monitor all platform users
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {users.length}
                  </div>
                  <div className="text-indigo-100 text-sm">Total Users</div>
                  <button
                    onClick={() => dispatch(fetchDashboardData())}
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/20 flex items-center gap-2 text-white"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Filter
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="logistics">Logistics</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <div className="relative">
                  <UserCheck
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="relative">
                  <SortAsc
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800"
                  >
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="email-asc">Email A-Z</option>
                    <option value="email-desc">Email Z-A</option>
                    <option value="role-asc">Role A-Z</option>
                    <option value="role-desc">Role Z-A</option>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {users.filter((u) => u.role === "user").length}
                      </div>
                      <div className="text-sm text-blue-600">Regular Users</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {users.filter((u) => u.role === "logistics").length}
                      </div>
                      <div className="text-sm text-green-600">Logistics</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {users.filter((u) => u.isActive !== false).length}
                      </div>
                      <div className="text-sm text-purple-600">
                        Active Users
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserX className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {users.filter((u) => u.isActive === false).length}
                      </div>
                      <div className="text-sm text-orange-600">Suspended</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {filteredUsers.some((user) => user.isActive === false) && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length > 0 &&
                        selectedUsers.length ===
                          filteredUsers.filter(
                            (user) => user.isActive === false
                          ).length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select All Suspended Users (
                      {
                        filteredUsers.filter((user) => user.isActive === false)
                          .length
                      }
                      )
                    </span>
                  </div>
                  {selectedUsers.length > 0 && (
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {selectedUsers.length} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={handleBulkUnsuspend}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <UserCheck size={16} />
                      Unsuspend Selected ({selectedUsers.length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showBulkActions ? "Hide" : "Show"} Bulk Actions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-blue-500 p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} />
              Users List ({filteredUsers.length} found)
            </h2>
          </div>

          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="text-gray-400 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {searchTerm || filterRole !== "all" || filterStatus !== "all"
                    ? "No Matching Users"
                    : "No Users Found"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterRole !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search criteria to find users."
                    : "No users have been registered on the platform yet."}
                </p>
                {(searchTerm ||
                  filterRole !== "all" ||
                  filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterRole("all");
                      setFilterStatus("all");
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length > 0 &&
                          selectedUsers.length ===
                            filteredUsers.filter(
                              (user) => user.isActive === false
                            ).length
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                      User
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                      Contact
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                      Joined
                    </th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.map((user, idx) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        {user.isActive === false && (
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-semibold">
                            {(user.name || user.companyName || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.name || user.companyName || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone size={14} />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            user.isActive === false
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}
                        >
                          {user.isActive === false ? (
                            <UserX size={14} />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          {user.isActive === false ? "Suspended" : "Active"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {user.role !== "admin" ? (
                            <>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                title="Edit User"
                              >
                                <Edit size={16} />
                              </button>
                              {user.isActive === false ? (
                                // Quick unsuspend button for suspended users
                                <button
                                  onClick={() => handleQuickUnsuspend(user)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                  title="Quick Unsuspend User"
                                >
                                  <UserCheck size={16} />
                                </button>
                              ) : (
                                // Action buttons for active users
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleQuickSuspend(user)}
                                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors duration-200"
                                    title="Quick Suspend"
                                  >
                                    <UserX size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleSuspendUser(user)}
                                    className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                                    title="Advanced Suspend (with date/reason)"
                                  >
                                    <Settings size={16} />
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <Shield size={16} />
                              <span>Admin</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
                  {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <UserEditModal
          user={currentUserToEdit}
          onClose={handleCloseEditModal}
          onSave={(updatedUser) => {
            handleCloseEditModal();
          }}
        />
      )}

      {/* Suspension Modal */}
      {isSuspendModalOpen && currentUserToSuspend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentUserToSuspend.isActive
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {currentUserToSuspend.isActive ? (
                    <UserX size={24} />
                  ) : (
                    <UserCheck size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentUserToSuspend.isActive
                      ? "Suspend User"
                      : "Reactivate User"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentUserToSuspend.name ||
                      currentUserToSuspend.companyName ||
                      currentUserToSuspend.email}
                  </p>
                </div>
              </div>

              {currentUserToSuspend.isActive && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suspension End Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={suspensionEndDate}
                      onChange={(e) => setSuspensionEndDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for indefinite suspension
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suspension Reason
                    </label>
                    <textarea
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="Enter reason for suspension..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCloseSuspendModal}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSuspend}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    currentUserToSuspend.isActive
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {currentUserToSuspend.isActive
                    ? "Suspend User"
                    : "Reactivate User"}
                </button>
              </div>
            </div>
          </div>
        </div>
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
        isOpen={showQuickUnsuspendConfirmDialog}
        onClose={() => {
          setShowQuickUnsuspendConfirmDialog(false);
          setPendingActionData(null);
        }}
        onConfirm={confirmQuickUnsuspend}
        title="Unsuspend User"
        message={`Are you sure you want to unsuspend ${
          pendingActionData?.user?.name ||
          pendingActionData?.user?.companyName ||
          pendingActionData?.user?.email
        }?`}
        confirmText="Unsuspend"
        cancelText="Cancel"
        type="success"
      />

      {/* Bulk Unsuspend Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBulkUnsuspendConfirmDialog}
        onClose={() => {
          setShowBulkUnsuspendConfirmDialog(false);
          setPendingActionData(null);
        }}
        onConfirm={confirmBulkUnsuspend}
        title="Bulk Unsuspend Users"
        message={`Are you sure you want to unsuspend ${
          pendingActionData?.suspendedUsers?.length || 0
        } user(s)?`}
        confirmText="Unsuspend All"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default AllUsersListPage;
