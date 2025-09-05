import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/slices/authSlice";
import ProfileForm from "../../components/forms/ProfileForm";
import { User, Shield, Settings, Edit3 } from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only fetch profile if user data is not already available
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  if (loading && !user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No profile data found</p>
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{user.name || 'User Profile'}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {user.verified ? 'Verified Account' : 'Unverified Account'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {user.role === 'logistics' ? 'Logistics Provider' : 'Shipper'}
              </div>
              <div className="text-sm text-blue-700">Account Type</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {user.phoneNumber || 'N/A'}
              </div>
              <div className="text-sm text-green-700">Phone Number</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.country || 'N/A'}
              </div>
              <div className="text-sm text-purple-700">Country</div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <Edit3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
          </div>
          <div className="p-6">
            <ProfileForm user={user} />
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">Account Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Password</h3>
                <p className="text-sm text-gray-600">Last changed: {user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                Enable 2FA
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Login Sessions</h3>
                <p className="text-sm text-gray-600">Manage your active login sessions</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-800">Account Actions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 className="font-medium text-red-800">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently remove your account and all data</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Delete Account
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <h3 className="font-medium text-yellow-800">Export Data</h3>
                <p className="text-sm text-yellow-600">Download a copy of your personal data</p>
              </div>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
