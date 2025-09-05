import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/slices/adminSlice';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const UserEditModal = ({ user, onClose, onSave }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [localErrors, setLocalErrors] = useState({});
  const { loading, error } = useSelector(state => state.admin);

  useEffect(() => {
    if (user) {
      // Initialize form data with current user details
      setFormData({ ...user });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setLocalErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name && formData.role !== 'logistics') {
      errors.name = 'Name is required';
    }
    if (!formData.companyName && formData.role === 'logistics') {
      errors.companyName = 'Company Name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    // Add more validation rules as needed
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const resultAction = await dispatch(updateUser({ userId: user._id, userData: formData }));
      if (updateUser.fulfilled.match(resultAction)) {
        onSave(resultAction.payload); // Pass the updated user back to the parent
        onClose();
      } else {
        toast.error(resultAction.payload?.message || 'Failed to update user.');
      }
    } catch (err) {
      console.error("Failed to save user updates:", err);
      toast.error('An unexpected error occurred during update.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit {user.role === 'logistics' ? 'Logistics Company' : 'User'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${localErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {localErrors.email && <p className="text-red-500 text-xs mt-1">{localErrors.email}</p>}
          </div>

          {user.role === 'user' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${localErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {localErrors.name && <p className="text-red-500 text-xs mt-1">{localErrors.name}</p>}
            </div>
          )}

          {user.role === 'logistics' && (
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${localErrors.companyName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {localErrors.companyName && <p className="text-red-500 text-xs mt-1">{localErrors.companyName}</p>}
            </div>
          )}

          {/* Add more fields for editing as needed, e.g., phoneNumber, address, etc. */}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;



