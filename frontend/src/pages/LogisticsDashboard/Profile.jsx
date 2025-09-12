import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchProfile } from '../../redux/slices/authSlice';
import ProfileForm from '../../components/forms/ProfileForm';
import { Truck, Shield, Settings, Edit3, Building, Globe, Award, Mail, Phone, Globe as WebsiteIcon, Calendar, Users, FileText } from "lucide-react";
import { getLogisticsDisplayName } from '../../utils/logisticsUtils';

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
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No profile data found</p>
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {getLogisticsDisplayName(user)}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              {/* Company name display */}
              {user.role === "logistics" && user.companyName && (
                <p className="text-blue-600 font-medium text-lg mt-1">
                  🏢 {user.companyName}
                </p>
              )}
              {/* Debug info */}
              <div className="text-xs text-gray-400 mt-1">
                Debug: companyName={user.companyName}, contactName={user.contactName}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    {user.verificationStatus === 'verified' ? 'Verified Partner' : 
                     user.verificationStatus === 'pending' ? 'Pending Verification' : 'Unverified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600">{user.country || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">{user.yearsInOperation || 'N/A'} years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {user.companySize || 'N/A'}
              </div>
              <div className="text-sm text-blue-700">Company Size</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {user.fleetSize || 'N/A'}
              </div>
              <div className="text-sm text-green-700">Fleet Size</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.registrationNumber || 'N/A'}
              </div>
              <div className="text-sm text-purple-700">Reg. Number</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {user.contactName || 'N/A'}
              </div>
              <div className="text-sm text-orange-700">Contact Person</div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Company Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Years in Operation:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.yearsInOperation || 'N/A'} years</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Company Size:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.companySize || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Registration Number:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.registrationNumber || 'N/A'}</span>
              </div>
              {user.website && (
                <div className="flex items-center gap-3">
                  <WebsiteIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Website:</span>
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Contact Person:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.contactName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Contact Email:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.contactEmail || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Contact Phone:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.contactPhone || 'N/A'}</span>
              </div>
              {user.contactPosition && (
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Position:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{user.contactPosition}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services & Regions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Services Offered
            </h3>
            <div className="space-y-2">
              {user.services && user.services.length > 0 ? (
                user.services.map((service, index) => (
                  <div key={index} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
                    {service}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No services specified</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Operating Regions
            </h3>
            <div className="space-y-2">
              {user.regions && user.regions.length > 0 ? (
                user.regions.map((region, index) => (
                  <div key={index} className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                    {region}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No regions specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
            <Edit3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Edit Company Profile</h2>
          </div>
          <div className="p-6">
            <ProfileForm user={user} />
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Verification Status</h2>
          </div>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              user.verificationStatus === 'verified' 
                ? 'bg-green-50 border-green-200' 
                : user.verificationStatus === 'pending'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Verification Status</h3>
                  <p className={`text-sm ${
                    user.verificationStatus === 'verified' 
                      ? 'text-green-600' 
                      : user.verificationStatus === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {user.verificationStatus === 'verified' 
                      ? 'Your company has been verified and approved' 
                      : user.verificationStatus === 'pending'
                      ? 'Your verification is currently under review'
                      : 'Your verification has been rejected'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.verificationStatus === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : user.verificationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.verificationStatus || 'Unknown'}
                </span>
              </div>
            </div>

            {user.verificationNotes && (
              <div className="bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Verification Notes</h4>
                <p className="text-sm text-gray-600">{user.verificationNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Account Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Password</h3>
                <p className="text-sm text-gray-600">Last changed: {user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Account Actions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 className="font-medium text-red-800">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently remove your company account and all data</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Delete Account
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <h3 className="font-medium text-yellow-800">Export Data</h3>
                <p className="text-sm text-yellow-600">Download a copy of your company data</p>
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