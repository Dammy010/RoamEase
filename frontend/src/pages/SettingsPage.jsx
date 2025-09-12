import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfilePictureUrl } from '../utils/imageUtils';
import ProfilePictureModal from '../components/shared/ProfilePictureModal';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  User, Bell, Shield, CreditCard, Globe, Moon, Sun, 
  Palette, DollarSign, Smartphone, Mail, MapPin, 
  Save, Edit3, Camera, LogOut, Trash2, AlertTriangle,
  CheckCircle, Settings as SettingsIcon, ChevronRight,
  Eye, EyeOff, Lock, Key, Smartphone as PhoneIcon,
  Check, X, Loader2, RefreshCw
} from 'lucide-react';
import { 
  updateSettings, 
  updateNotifications, 
  updatePrivacy, 
  getSettings,
  clearSettingsError,
  setCurrency,
  updateNotificationPreference,
  updatePrivacyPreference,
  initializeSettings,
  uploadProfilePicture,
  removeProfilePicture,
  changePassword,
  updateProfile
} from '../redux/slices/settingsSlice';
import { logout } from '../redux/slices/authSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme, isDark } = useTheme();
  const { currency, setCurrency: setCurrencyContext, currencies, formatCurrency } = useCurrency();
  
  const { 
    settings, 
    notifications: notificationSettings, 
    privacy: privacySettings, 
    loading, 
    error, 
    updateLoading 
  } = useSelector((state) => state.settings);
  
  // Profile picture modal state
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.role === 'logistics' ? (user?.companyName || '') : (user?.name || ''),
    email: user?.email || '',
    phone: user?.role === 'logistics' ? (user?.contactPhone || '') : (user?.phoneNumber || ''),
    companyName: user?.companyName || '',
    country: user?.country || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Form validation states
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});

  // Initialize settings on mount
  useEffect(() => {
    dispatch(initializeSettings());
    dispatch(getSettings());
    
    // Initialize currency from user settings
    if (user?.preferences?.currency) {
      setCurrencyContext(user.preferences.currency);
      dispatch(setCurrency(user.preferences.currency));
    }
  }, [dispatch, user, setCurrencyContext]);

  // Sync currency when settings are loaded
  useEffect(() => {
    if (settings?.currency && settings.currency !== currency) {
      setCurrencyContext(settings.currency);
      dispatch(setCurrency(settings.currency));
    }
  }, [settings?.currency, currency, setCurrencyContext, dispatch]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSettingsError());
    };
  }, [dispatch]);

  // Handle currency change
  const handleCurrencyChange = async (newCurrency) => {
    if (newCurrency === currency) return; // Don't update if same currency
    
    try {
      // Update Redux state immediately for UI responsiveness
      dispatch(setCurrency(newCurrency));
      
      // Update CurrencyContext
      setCurrencyContext(newCurrency);
      
      // Update backend settings
      const result = await dispatch(updateSettings({ currency: newCurrency }));
      
      if (updateSettings.fulfilled.match(result)) {
        toast.success(`Currency changed to ${newCurrency}`);
      } else {
        // Revert on error
        dispatch(setCurrency(currency));
        setCurrencyContext(currency);
        toast.error('Failed to update currency');
      }
    } catch (error) {
      console.error('Error changing currency:', error);
      // Revert on error
      dispatch(setCurrency(currency));
      setCurrencyContext(currency);
      toast.error('Failed to update currency');
    }
  };

  // Handle profile save
  const handleProfileSave = async () => {
    setProfileErrors({});
    
    // Basic validation
    if (!profileData.name.trim()) {
      setProfileErrors({ name: 'Name is required' });
      return;
    }
    
    if (!profileData.email.trim()) {
      setProfileErrors({ email: 'Email is required' });
      return;
    }

    try {
      const result = await dispatch(updateProfile(profileData));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully');
        setIsEditingProfile(false);
      } else {
        toast.error(result.payload || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordErrors({});
    
    // Validation
    if (!passwordData.currentPassword) {
      setPasswordErrors({ currentPassword: 'Current password is required' });
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordErrors({ newPassword: 'New password is required' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      const result = await dispatch(changePassword(passwordData));
      if (changePassword.fulfilled.match(result)) {
        toast.success('Password changed successfully');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.payload || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (key) => {
    const newValue = !notificationSettings[key];
    dispatch(updateNotificationPreference({ key, value: newValue }));
    dispatch(updateNotifications({ [key]: newValue }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (key) => {
    const newValue = !privacySettings[key];
    dispatch(updatePrivacyPreference({ key, value: newValue }));
    dispatch(updatePrivacy({ [key]: newValue }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} visibility ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Profile picture handlers
  const handleProfilePictureUpload = async (file) => {
    try {
      const result = await dispatch(uploadProfilePicture(file));
      if (uploadProfilePicture.fulfilled.match(result)) {
        toast.success('Profile picture updated successfully');
        setShowProfilePictureModal(false);
      } else {
        toast.error(result.payload || 'Failed to upload profile picture');
      }
    } catch (error) {
      toast.error('Failed to upload profile picture');
    }
  };

  const handleProfilePictureRemove = async () => {
    try {
      const result = await dispatch(removeProfilePicture());
      if (removeProfilePicture.fulfilled.match(result)) {
        toast.success('Profile picture removed successfully');
      } else {
        toast.error(result.payload || 'Failed to remove profile picture');
      }
    } catch (error) {
      toast.error('Failed to remove profile picture');
    }
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Settings sections
  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Control your notification preferences'
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: Shield,
      description: 'Manage your privacy settings'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Lock,
      description: 'Password and security settings'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: SettingsIcon,
      description: 'Theme, currency, and app preferences'
    }
  ];

  const [activeSection, setActiveSection] = useState('profile');

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={getProfilePictureUrl(user?.profilePicture)}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={() => setShowProfilePictureModal(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:bg-blue-700 transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.role === 'logistics' ? user?.companyName : user?.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          <button
            onClick={() => setShowProfilePictureModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Change Photo
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {user?.role === 'logistics' ? 'Company Name' : 'Full Name'}
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            disabled={!isEditingProfile}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
              profileErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {profileErrors.name && (
            <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
          )}
        </div>

        {privacySettings?.showEmail !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              disabled={!isEditingProfile}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
                profileErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
            )}
          </div>
        )}

        {privacySettings?.showPhone !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              disabled={!isEditingProfile}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            />
          </div>
        )}

        {privacySettings?.showLocation !== false && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={profileData.country}
                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                disabled={!isEditingProfile}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                disabled={!isEditingProfile}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            disabled={!isEditingProfile}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      {/* Profile Actions */}
      <div className="flex justify-end space-x-4">
        {isEditingProfile ? (
          <>
            <button
              onClick={() => {
                setIsEditingProfile(false);
                setProfileData({
                  name: user?.role === 'logistics' ? (user?.companyName || '') : (user?.name || ''),
                  email: user?.email || '',
                  phone: user?.role === 'logistics' ? (user?.contactPhone || '') : (user?.phoneNumber || ''),
                  companyName: user?.companyName || '',
                  country: user?.country || '',
                  address: user?.address || '',
                  bio: user?.bio || ''
                });
                setProfileErrors({});
              }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProfileSave}
              disabled={updateLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {updateLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {key === 'email' && 'Receive email notifications'}
                  {key === 'push' && 'Receive push notifications'}
                  {key === 'sms' && 'Receive SMS notifications'}
                  {key === 'marketing' && 'Receive marketing emails'}
                  {key === 'security' && 'Receive security alerts'}
                  {key === 'updates' && 'Receive app updates'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(privacySettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {key === 'profileVisibility' && 'Make your profile visible to others'}
                  {key === 'showEmail' && 'Show email address on profile'}
                  {key === 'showPhone' && 'Show phone number on profile'}
                  {key === 'showLocation' && 'Show location on profile'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePrivacyToggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Change your password to keep your account secure
            </p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={updateLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Sign Out</h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              Sign out of your account on this device
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred theme
              </p>
            </div>
          </div>
          <ThemeToggle showLabel={true} />
        </div>
      </div>

      {/* Currency */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Currency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select your preferred currency for displaying prices
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current: {currency}
            </div>
            {updateLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>
        </div>
        
        {/* Current Currency Display */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currencies.find(c => c.code === currency)?.flag || '💱'}</div>
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-300">
                  {currencies.find(c => c.code === currency)?.name || 'Unknown Currency'}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  {currency} - {currencies.find(c => c.code === currency)?.symbol || '$'}
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Example: {formatCurrency(100)}
            </div>
          </div>
        </div>
        
        {/* Currency Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              disabled={updateLoading}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                currency === curr.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } ${updateLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{curr.flag}</div>
                <div className="text-sm font-medium">{curr.code}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{curr.symbol}</div>
                {currency === curr.code && (
                  <div className="mt-1">
                    <CheckCircle className="w-4 h-4 text-blue-600 mx-auto" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Currency Info */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> Currency changes will apply to all price displays throughout the app. 
            Exchange rates are updated regularly and are for reference purposes only.
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'privacy':
        return renderPrivacySection();
      case 'security':
        return renderSecuritySection();
      case 'preferences':
        return renderPreferencesSection();
      default:
        return renderProfileSection();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {section.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {showProfilePictureModal && (
        <ProfilePictureModal
          isOpen={showProfilePictureModal}
          onClose={() => setShowProfilePictureModal(false)}
          onUpload={handleProfilePictureUpload}
          onRemove={handleProfilePictureRemove}
          currentImage={getProfilePictureUrl(user?.profilePicture)}
        />
      )}
    </div>
  );
};

export default SettingsPage;