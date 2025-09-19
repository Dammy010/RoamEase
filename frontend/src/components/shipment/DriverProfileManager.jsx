import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Clock,
  Save,
  Edit3,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

const DriverProfileManager = ({ shipmentId, onProfileUpdate }) => {
  const [profile, setProfile] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    bio: "",
    country: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log("Loading profile...");
      const response = await api.get("/auth/profile");
      console.log("Profile load response:", response.data);

      if (response.data.success) {
        const userData = response.data.user;
        console.log("User data:", userData);
        setProfile({
          name: userData.name || "",
          companyName: userData.companyName || "",
          phone: userData.phone || userData.phoneNumber || "",
          email: userData.email || "",
          address: userData.address || "",
          bio: userData.bio || "",
          country: userData.country || "",
        });
      } else {
        console.error("Profile load failed:", response.data.message);
        toast.error("Failed to load profile: " + response.data.message);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        "Failed to load profile: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving profile data:", profile);
      const response = await api.put("/auth/profile", profile);
      console.log("Profile update response:", response.data);

      if (response.data.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        if (onProfileUpdate) {
          onProfileUpdate(profile);
        }
      } else {
        toast.error(
          "Failed to update profile: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        "Failed to update profile: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile(); // Reload original data
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Driver Profile
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Driver Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter driver name"
            />
          ) : (
            <p className="text-gray-900">{profile.name || "Not provided"}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="companyName"
              value={profile.companyName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
            />
          ) : (
            <p className="text-gray-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              {profile.companyName || "Not provided"}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          ) : (
            <p className="text-gray-900 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              {profile.phone || "Not provided"}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          ) : (
            <p className="text-gray-900 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              {profile.email || "Not provided"}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          {isEditing ? (
            <textarea
              name="address"
              value={profile.address}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address"
            />
          ) : (
            <p className="text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              {profile.address || "Not provided"}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio/Description
          </label>
          {isEditing ? (
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell customers about yourself"
            />
          ) : (
            <p className="text-gray-900">
              {profile.bio || "No description provided"}
            </p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          {isEditing ? (
            <input
              type="text"
              name="country"
              value={profile.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter country"
            />
          ) : (
            <p className="text-gray-900">{profile.country || "Not provided"}</p>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-blue-800">
            This information will be visible to customers tracking their
            shipments. Keep it updated for better customer experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverProfileManager;
