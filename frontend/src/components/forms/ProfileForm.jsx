import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { Camera, FileText, UserCircle, Truck, ClipboardCheck } from 'lucide-react';
import PasswordInput from "../shared/PasswordInput"; // Corrected: Added the missing import for PasswordInput

// Input Component with enhanced styling
const Input = ({ label, id, type = "text", required, ...props }) => (
  <div className="mb-5">
    {label && (
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
    )}
    <input
      id={id}
      type={type}
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800"
    />
  </div>
);

// Select Component with enhanced styling
const Select = ({ label, id, options, optionLabels, required, ...props }) => (
  <div className="mb-5">
    {label && (
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
    )}
    <select
      id={id}
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out bg-white text-gray-800"
    >
      <option value="">Select {label?.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {optionLabels ? optionLabels[opt] || opt : opt}
        </option>
      ))}
    </select>
  </div>
);

// Profile Picture Modal Component with upload functionality
export const ProfilePictureModal = ({ imageUrl, onClose, onUpload, uploadLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(imageUrl);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(imageUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 text-2xl hover:text-gray-700"
          aria-label="Close"
        >
          &times;
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        
        <div className="text-center mb-4">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile Preview" 
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200" 
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
              <span className="text-gray-500 text-2xl">No Image</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploadLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


const ProfileForm = ({ user }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    profilePicture: null,
    companyName: "",
    country: "",
    yearsInOperation: "",
    registrationNumber: "",
    companySize: "",
    contactName: "",
    contactPosition: "",
    contactPhone: "",
    services: [],
    regions: [],
    fleetSize: "",
    website: "",
    businessLicense: null,
    insuranceCertificate: null,
    governmentId: null,
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [docPreviews, setDocPreviews] = useState({
    businessLicense: null,
    insuranceCertificate: null,
    governmentId: null,
  });

  const [showProfilePicModal, setShowProfilePicModal] = useState(false);

  const getStaticAssetUrl = useCallback((relativePath) => {
    if (!relativePath) return null;
    const backendStaticBaseUrl = 'http://localhost:5000';
    let fullUrl = `${backendStaticBaseUrl}/${relativePath.replace(/\\/g, '/')}`;
    if (relativePath.startsWith('/') && backendStaticBaseUrl.endsWith('/')) {
        fullUrl = `${backendStaticBaseUrl}${relativePath.substring(1)}`;
    }
    return fullUrl;
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        currentPassword: "",
        newPassword: "",
        profilePicture: null,
        companyName: user.companyName || "",
        country: user.country || "",
        yearsInOperation: user.yearsInOperation || "",
        registrationNumber: user.registrationNumber || "",
        companySize: user.companySize || "",
        contactName: user.contactName || "",
        contactPosition: user.contactPosition || "",
        contactPhone: user.contactPhone || "",
        services: user.services || [],
        regions: user.regions || [],
        fleetSize: user.fleetSize || "",
        website: user.website || "",
        businessLicense: null,
        insuranceCertificate: null,
        governmentId: null,
      });

      setProfilePicPreview(getStaticAssetUrl(user.profilePicture));
      setDocPreviews({
        businessLicense: getStaticAssetUrl(user.documents?.businessLicense),
        insuranceCertificate: getStaticAssetUrl(user.documents?.insuranceCertificate),
        governmentId: getStaticAssetUrl(user.documents?.governmentId),
      });
    }
  }, [user, getStaticAssetUrl]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'services' || name === 'regions') {
        const selectedOptions = Array.from(e.target.options).filter(option => option.selected).map(option => option.value);
        setFormData((prev) => ({ ...prev, [name]: selectedOptions }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleFileChange = useCallback((e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      const objectUrl = URL.createObjectURL(file);
      if (fieldName === 'profilePicture') {
        setProfilePicPreview(objectUrl);
      } else {
        setDocPreviews((prev) => ({ ...prev, [fieldName]: objectUrl }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [fieldName]: null }));
      if (fieldName === 'profilePicture') {
        setProfilePicPreview(getStaticAssetUrl(user?.profilePicture));
      } else {
        setDocPreviews((prev) => ({ ...prev, [fieldName]: getStaticAssetUrl(user?.documents?.[fieldName]) }));
      }
    }
  }, [user, getStaticAssetUrl]);

  const handleProfilePicClick = useCallback(() => {
    if (profilePicPreview) {
      setShowProfilePicModal(true);
    }
  }, [profilePicPreview]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (formData.newPassword && !formData.currentPassword) {
        toast.error("Please enter your current password to set a new password.");
        return;
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'currentPassword' || key === 'newPassword') {
          return;
        }
        
        if (value instanceof File) {
          data.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => data.append(`${key}[]`, item));
        } else if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
      
      if (formData.currentPassword) {
        data.append('currentPassword', formData.currentPassword);
      }
      if (formData.newPassword) {
        data.append('password', formData.newPassword);
      }

      console.log('Frontend: Dispatching updateProfile with FormData entries:');
      for (let pair of data.entries()) {
          console.log(pair[0]+ ': ' + pair[1]); 
      }

      const resultAction = await dispatch(updateProfile(data));

      if (updateProfile.fulfilled.match(resultAction)) {
        toast.success("Profile updated successfully!");
        setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      }
    },
    [dispatch, formData]
  );

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-2xl border border-gray-100 max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Edit Profile</h2>

      {/* Personal Information Section */}
      <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <UserCircle size={24} className="text-indigo-500" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Email" id="email" name="email" value={formData.email} onChange={handleChange} type="email" required />
          <Input label="Phone Number" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
          <div className="flex flex-col items-center justify-center">
            <label htmlFor="profilePicture" className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
            <div className="relative w-32 h-32 rounded-full border-4 border-indigo-300 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-indigo-500 transition duration-300" onClick={handleProfilePicClick}>
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-600 text-5xl font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera size={32} />
              </div>
            </div>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'profilePicture')}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText size={24} className="text-indigo-500" /> Change Password
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New: Use PasswordInput for currentPassword */}
          <PasswordInput
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
            required={!!formData.newPassword}
          />
          {/* New: Use PasswordInput for newPassword */}
          <PasswordInput
            label="New Password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Leave blank to keep current"
          />
        </div>
      </div>

      {/* Logistics Specific Fields */}
      {user?.role === "logistics" && (
        <>
          <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Truck size={24} className="text-indigo-500" /> Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Company Name" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required />
              <Select
                label="Country"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                options={["USA", "UK", "Canada", "Germany", "China", "Nigeria", "Ghana", "Benin"]}
                required
              />
              <Input label="Years in Operation" id="yearsInOperation" name="yearsInOperation" type="number" value={formData.yearsInOperation} onChange={handleChange} min="0" required />
              <Input label="Registration Number" id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
              <Select
                label="Company Size"
                id="companySize"
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                options={["small", "medium", "large", "enterprise"]}
                optionLabels={{
                  small: "1-50 employees",
                  medium: "51-200 employees", 
                  large: "201-500 employees",
                  enterprise: "500+ employees"
                }}
                required
              />
              <Input label="Website" id="website" name="website" value={formData.website} onChange={handleChange} type="url" />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserCircle size={24} className="text-indigo-500" /> Contact Person
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Contact Name" id="contactName" name="contactName" value={formData.contactName} onChange={handleChange} required />
              <Input label="Contact Position" id="contactPosition" name="contactPosition" value={formData.contactPosition} onChange={handleChange} required />
              <Input label="Contact Phone" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ClipboardCheck size={24} className="text-indigo-500" /> Services & Regions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="services" className="block text-sm font-semibold text-gray-700 mb-2">Services Offered</label>
                <select
                  id="services"
                  name="services"
                  multiple
                  value={formData.services}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 bg-white text-gray-800"
                >
                  {["Air Freight", "Sea Freight", "Road Transport", "Rail Transport", "Warehousing", "Customs Clearance", "Express Delivery"].map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="regions" className="block text-sm font-semibold text-gray-700 mb-2">Regions Covered</label>
                <select
                  id="regions"
                  name="regions"
                  multiple
                  value={formData.regions}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 bg-white text-gray-800"
                >
                  {["North America", "South America", "Europe", "Asia", "Africa", "Oceania"].map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <Input label="Fleet Size" id="fleetSize" name="fleetSize" type="number" value={formData.fleetSize} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText size={24} className="text-indigo-500" /> Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="businessLicense" className="block text-sm font-semibold text-gray-700 mb-2">Business License</label>
                <input type="file" id="businessLicense" name="businessLicense" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleFileChange(e, 'businessLicense')} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {docPreviews.businessLicense && (
                  <p className="text-sm text-gray-500 mt-2">Current: <a href={docPreviews.businessLicense} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Document</a></p>
                )}
              </div>
              <div>
                <label htmlFor="insuranceCertificate" className="block text-sm font-semibold text-gray-700 mb-2">Insurance Certificate</label>
                <input type="file" id="insuranceCertificate" name="insuranceCertificate" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleFileChange(e, 'insuranceCertificate')} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {docPreviews.insuranceCertificate && (
                  <p className="text-sm text-gray-500 mt-2">Current: <a href={docPreviews.insuranceCertificate} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Document</a></p>
                )}
              </div>
              <div>
                <label htmlFor="governmentId" className="block text-sm font-semibold text-gray-700 mb-2">Government ID</label>
                <input type="file" id="governmentId" name="governmentId" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleFileChange(e, 'governmentId')} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {docPreviews.governmentId && (
                  <p className="text-sm text-gray-500 mt-2">Current: <a href={docPreviews.governmentId} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Document</a></p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
        }`}
      >
        {loading ? "Updating Profile..." : "Update Profile"}
      </button>

      {showProfilePicModal && (
        <ProfilePictureModal imageUrl={profilePicPreview} onClose={() => setShowProfilePicModal(false)} />
      )}
    </form>
  );
};

export default ProfileForm;
