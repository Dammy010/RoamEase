import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useCallback, useRef
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../../redux/slices/authSlice';
import PasswordInput from '../shared/PasswordInput';
import { Truck, Ship, Plane, Train, MapPin, Warehouse } from 'lucide-react'; // Updated: Imported more icons
import FormSection from './FormSection';
import { isEqual } from 'lodash'; // Added isEqual for document comparison

const ROLES = {
  USER: 'user',
  LOGISTICS: 'logistics',
};

const REQUIRED_FIELDS = {
  [ROLES.USER]: ['name', 'email', 'password', 'confirmPassword', 'phoneNumber'],
  [ROLES.LOGISTICS]: [
    'companyName',
    'yearsInOperation',
    'registrationNumber',
    'country',
    'companySize',
    'contactName',
    'contactEmail',
    'contactPosition',
    'contactPhone',
    'password',
    'confirmPassword',
    'services',
    'regions',
    'businessLicense',
    'insuranceCertificate',
    'governmentId',
    'agreements',
    'terms',
  ],
};

const SignupForm = () => {
  console.count('SignupForm Render');
  const [formData, setFormData] = useState({
    // User fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: ROLES.USER,
    // Logistics fields
    companyName: '',
    country: '',
    yearsInOperation: '',
    registrationNumber: '',
    companySize: '',
    contactName: '',
    contactEmail: '',
    contactPosition: '',
    contactPhone: '',
    services: [],
    regions: [],
    documents: {},
    agreements: false,
    terms: false,
    fleetSize: '',
    website: '',
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Ref to hold the latest formData, accessible synchronously
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData; // Keep the ref always up-to-date
    console.log('formDataRef updated', formData);
  }, [formData]);

  useEffect(() => {
    if (user?.role) {
      navigate(user.role === ROLES.USER ? '/user/dashboard' : '/logistics/dashboard');
    }
  }, [user, navigate]);

  // validateField should be stable. It depends on formData.role and formData.password
  // We extract formData.password here for stability in validateField.
  const validateField = useCallback((name, value, currentFormData, passwordValue) => {
  console.log(`Validating field: ${name}, value: ${value}`);
  const role = currentFormData.role;

  // Required check
  if (!value && REQUIRED_FIELDS[role].includes(name)) return 'This field is required';

  // Role-specific email validation
  if (name === 'email' && role === ROLES.USER) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
  }
  if (name === 'contactEmail' && role === ROLES.LOGISTICS) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
  }

  // Password validation
  if (name === 'password' && value && value.length < 6) return 'Password must be at least 6 characters';
  if (name === 'confirmPassword' && value !== passwordValue) return 'Passwords do not match';

  // Agreements/terms validation
  if (['agreements', 'terms'].includes(name) && !value) return 'You must accept this';

  return '';
}, []);


  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    console.log(`handleChange called for ${name}: ${value}`);


    setFormData((prevFormData) => {
      let newFormData = { ...prevFormData };

      if (type === 'checkbox' && (name.startsWith('services-') || name.startsWith('regions-'))) {
        const field = name.startsWith('services-') ? 'services' : 'regions';
        const serviceOrRegionValue = value;
        const updatedArray = checked
          ? [...prevFormData[field], serviceOrRegionValue]
          : prevFormData[field].filter((item) => item !== serviceOrRegionValue);
        
        newFormData[field] = updatedArray;
      } else if (type === 'checkbox') {
        newFormData[name] = checked;
      } else if (name === 'email' || name === 'contactEmail') {
        // Preserve actual email field for logistics, but update contactEmail for display
        if (prevFormData.role === ROLES.LOGISTICS && name === 'email') {
          newFormData.contactEmail = value; // Update contactEmail if this is a logistics form and email is changed
        } else {
          newFormData[name] = value; // For user role, or other non-email fields
        }
      }else {
        newFormData[name] = value;
      }

      // IMPORTANT: Only update if newFormData is deeply different from prevFormData
      if (!isEqual(prevFormData, newFormData)) {
        formDataRef.current = newFormData; // Keep the ref always up-to-date
        console.log(`setFormData updating for ${name}:`, newFormData);
        return newFormData;
      } else {
        console.log(`setFormData no deep change for ${name}`);
        return prevFormData; // No deep change, return previous state to prevent re-render
      }
    });

    setErrors((prevErrors) => {
      let newError = '';
      const passwordValueForValidation = formDataRef.current.password;

      if (type === 'checkbox' && (name.startsWith('services-') || name.startsWith('regions-'))) {
        newError = '';
      } else if (type === 'checkbox') {
        newError = checked ? '' : 'You must accept this';
      } else {
        newError = validateField(
          name,
          value,
          formDataRef.current, 
          name === 'confirmPassword' ? passwordValueForValidation : null
        );
      }
      console.log(`setErrors for ${name}: prevErrors[${name}] = ${prevErrors[name]}, newError = ${newError}`);
      // Only update errors if the error message for this specific field has changed
      if (prevErrors[name] !== newError) {
        console.log(`setErrors updating ${name} from '${prevErrors[name]}' to '${newError}'`);
        return { ...prevErrors, [name]: newError };
      }
      console.log(`setErrors no change for ${name}`);
      return prevErrors; // No change, return previous errors object to prevent re-render
    });
  }, [validateField]); // Dependency on validateField (now stable)


  const handleFileUpload = useCallback((e, field) => {
    const file = e.target.files[0];
    console.log(`handleFileUpload called for ${field}:`, file?.name);
    setFormData((prev) => {
      const newDocuments = { ...prev.documents, [field]: file };
      if (!isEqual(prev.documents, newDocuments)) {
        console.log(`setFormData updating document ${field}:`, file?.name);
        return { ...prev,
          documents: newDocuments
        };
      }
      console.log(`setFormData no change for document ${field}`);
      return prev;
    });
    setErrors((prevErrors) => {
      const newError = file ? '' : 'Please upload this document';
      console.log(`setErrors for document ${field}: prevErrors[${field}] = ${prevErrors[field]}, newError = ${newError}`);
      if (prevErrors[field] !== newError) {
        console.log(`setErrors updating document ${field} from '${prevErrors[field]}' to '${newError}'`);
        return { ...prevErrors, [field]: newError };
      }
      console.log(`setErrors no change for document ${field}`);
      return prevErrors;
    });
  }, []);

  const switchRole = useCallback((role) => {
    console.log('Switching role to:', role);
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        role,
        services: role === ROLES.LOGISTICS ? [] : prev.services,
        regions: role === ROLES.LOGISTICS ? [] : prev.regions,
        documents: role === ROLES.LOGISTICS ? {} : {},
        agreements: false,
        terms: false,
      };
      if (!isEqual(prev, newFormData)) {
        console.log('setFormData updating for role switch');
        return newFormData;
      }
      console.log('setFormData no change for role switch');
      return prev;
    });
    setErrors((prevErrors) => {
      if (Object.keys(prevErrors).length > 0) {
        console.log('setErrors clearing errors on role switch');
        return {};
      }
      console.log('setErrors no change (no errors to clear) on role switch');
      return prevErrors;
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    const newErrors = {};
    const requiredFields = REQUIRED_FIELDS[formData.role];

    requiredFields.forEach((field) => {
      const passwordValueForValidation = formData.password;

      if (['services', 'regions'].includes(field)) {
        if (formData[field].length === 0) newErrors[field] = `Select at least one ${field}`;
      } else if (['agreements', 'terms'].includes(field)) {
        if (!formData[field]) newErrors[field] = 'You must accept this';
      } else if (['businessLicense', 'insuranceCertificate', 'governmentId'].includes(field)) {
        if (!formData.documents[field]) newErrors[field] = 'Document is required';
      } else {
        const msg = validateField(field, formData[field], formData, field === 'confirmPassword' ? passwordValueForValidation : null); // Pass formData and passwordValue
        if (msg) newErrors[field] = msg;
      }
    });

    if (Object.keys(newErrors).length) {
      console.log('handleSubmit setting new errors:', newErrors);
      setErrors(newErrors);
      return;
    }

    console.log('handleSubmit clearing errors (no new errors)');
    setErrors({});

    if (formData.role === ROLES.LOGISTICS) {
      const payload = new FormData();

      // Append primitive top-level fields
      const primitiveFields = [
        'companyName',
        'country',
        'yearsInOperation',
        'registrationNumber',
        'companySize',
        'contactName',
        'contactEmail',
        'contactPosition',
        'contactPhone',
        'password',
        'confirmPassword',
        'fleetSize',
        'website',
        'agreements',
        'terms',
      ];
      primitiveFields.forEach((key) => {
        let value = formData[key];
        if (key === 'yearsInOperation') value = Number(value);
        if (typeof value === 'boolean') value = value ? 'true' : 'false';
        payload.append(key, value);
      });

      // Explicitly append email and role for logistics to FormData
      console.log('DEBUG - Frontend formData.email before FormData append:', formData.email);
      console.log('DEBUG - Frontend formData.contactEmail before FormData append:', formData.contactEmail);
      payload.append('email', formData.contactEmail);
      payload.append('role', formData.role);

      // Append arrays
      ['services', 'regions'].forEach((key) => {
        formData[key].forEach((item) => payload.append(key, item));
      });

      // Append documents
      Object.keys(formData.documents).forEach((docKey) => {
        payload.append(docKey, formData.documents[docKey]);
      });

      dispatch(signupUser(payload));
    } else {
      dispatch(signupUser(formData));
    }
  }, [formData, dispatch, validateField]);

  // Helper for rendering form sections with consistent styling


  const getServiceIcon = (service) => {
    switch (service) {
      case 'Trucking':
        return <Truck size={16} className="text-indigo-500" />;
      case 'Shipping':
        return <Ship size={16} className="text-indigo-500" />;
      case 'Air Freight':
        return <Plane size={16} className="text-indigo-500" />;
      case 'Rail':
        return <Train size={16} className="text-indigo-500" />;
      case 'Last-Mile Delivery':
        return <MapPin size={16} className="text-indigo-500" />;
      case 'Warehousing':
        return <Warehouse size={16} className="text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-2xl my-10">
      {/* Role Toggle */}
      <div className="flex justify-center mb-8 space-x-4">
        {Object.values(ROLES).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => switchRole(role)}
            className={`px-8 py-3 rounded-full font-semibold text-lg shadow-md transition-all duration-300 ${
              formData.role === role
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {role === ROLES.USER ? 'Sign Up as User' : 'Sign Up as Logistics Provider'}
          </button>
        ))}
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
        {formData.role === ROLES.LOGISTICS ? 'Become a Logistics Partner' : 'Create Your User Account'}
      </h1>

      {formData.role === ROLES.USER ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div >
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Name <span className="text-red-500"> *</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="name"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.name}</p>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500"> *</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  autoComplete="off"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.email}</p>
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500"> *</span></label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.phoneNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="tel"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.phoneNumber}</p>
              </div>
            </div>
          </FormSection>

          <FormSection title="Account Security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordInput
                label="Password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                error={errors.password} // Pass specific error
                // autoComplete="new-password"
              />
              {/* <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.password}</p> */}
              <PasswordInput
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword} // Pass specific error
                // autoComplete="new-password"
              />
              {/* <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.confirmPassword}</p> */}
            </div>
          </FormSection>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
          <p className="text-red-500 text-sm mt-2 text-center min-h-[1.25rem]">{error}</p>
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Info */}
          <FormSection title="Company Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">Company Name <span className="text-red-500"> *</span></label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.companyName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="organization"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.companyName}</p>
              </div>
              <div>
                <label htmlFor="yearsInOperation" className="block text-sm font-semibold text-gray-700 mb-2">Years in Operation <span className="text-red-500"> *</span></label>
                <input
                  id="yearsInOperation"
                  name="yearsInOperation"
                  type="number"
                  value={formData.yearsInOperation}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.yearsInOperation ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="off"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.yearsInOperation}</p>
              </div>
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-semibold text-gray-700 mb-2">Registration Number <span className="text-red-500"> *</span></label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.registrationNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="off"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.registrationNumber}</p>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">Country <span className="text-red-500"> *</span></label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.country ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="country-name"
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="DE">Germany</option>
                  <option value="NG">Nigeria</option>
                </select>
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.country}</p>
              </div>
              <div>
                <label htmlFor="companySize" className="block text-sm font-semibold text-gray-700 mb-2">Company Size <span className="text-red-500"> *</span></label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.companySize ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="off"
                >
                  <option value="">Select size</option>
                  <option value="small">1-50 employees</option>
                  <option value="medium">51-200 employees</option>
                  <option value="large">201-500 employees</option>
                  <option value="enterprise">500+ employees</option>
                </select>
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.companySize}</p>
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.website ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  placeholder="e.g. https://www.example.com"
                  // autoComplete="url"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.website}</p>
              </div>
              <div>
                <label htmlFor="fleetSize" className="block text-sm font-semibold text-gray-700 mb-2">Fleet Size</label>
                <input
                  id="fleetSize"
                  name="fleetSize"
                  type="number"
                  value={formData.fleetSize}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.fleetSize ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  min="0"
                  // autoComplete="off"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.fleetSize}</p>
              </div>
            </div>
          </FormSection>

          {/* Contact Info */}
          <FormSection title="Contact Person Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 mb-2">Contact Name <span className="text-red-500"> *</span></label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.contactName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="cc-name"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.contactName}</p>
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">Contact Email <span className="text-red-500"> *</span></label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.contactEmail ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  autoComplete="off"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.contactEmail}</p>
              </div>
              <div>
                <label htmlFor="contactPosition" className="block text-sm font-semibold text-gray-700 mb-2">Contact Position <span className="text-red-500"> *</span></label>
                <input
                  id="contactPosition"
                  name="contactPosition"
                  type="text"
                  value={formData.contactPosition}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.contactPosition ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="organization-title"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.contactPosition}</p>
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone <span className="text-red-500"> *</span></label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 ${errors.contactPhone ? 'border-red-500 focus:ring-red-400' : 'border-gray-300'}`}
                  // autoComplete="tel"
                />
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.contactPhone}</p>
              </div>
            </div>
          </FormSection>

          {/* Passwords */}
          <FormSection title="Account Security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordInput
                label="Password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                error={errors.password} // Pass specific error
                // autoComplete="new-password"
              />
              {/* <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.password}</p> */}
              <PasswordInput
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword} // Pass specific error
                // autoComplete="new-password"
              />
              {/* <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.confirmPassword}</p> */}
            </div>
          </FormSection>

          {/* Capabilities */}
          <FormSection title="Logistics Capabilities & Regions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Services */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Truck size={20} className="text-indigo-500" /> Transport Services <span className="text-red-500"> *</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
                  {['Trucking', 'Shipping', 'Air Freight', 'Rail', 'Last-Mile Delivery', 'Warehousing'].map(
                    (service) => (
                      <label key={service} className="flex items-center text-gray-700">
                        <input
                          type="checkbox"
                          name={`services-${service}`}
                          value={service}
                          checked={formData.services.includes(service)}
                          onChange={handleChange}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          // autoComplete="off"
                        />
                        <span className="flex items-center gap-1">
                          {getServiceIcon(service)} {service}
                        </span>
                      </label>
                    )
                  )}
                </div>
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.services}</p>
              </div>

              {/* Regions */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Regions Served <span className="text-red-500"> *</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
                  {['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'].map(
                    (region) => (
                      <label key={region} className="flex items-center text-gray-700">
                        <input
                          type="checkbox"
                          name={`regions-${region}`}
                          value={region}
                          checked={formData.regions.includes(region)}
                          onChange={handleChange}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          // autoComplete="off"
                        />
                        {region}
                      </label>
                    )
                  )}
                </div>
                <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.regions}</p>
              </div>
            </div>
          </FormSection>

          {/* Documents */}
          <FormSection title="Required Documents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Business License', key: 'businessLicense' },
                { label: 'Insurance Certificate', key: 'insuranceCertificate' },
                { label: 'Government ID', key: 'governmentId' },
              ].map((doc) => (
                <div key={doc.key}>
                  <label htmlFor={doc.key} className="block text-sm font-semibold text-gray-700 mb-2">{doc.label} <span className="text-red-500"> *</span></label>
                  <input
                    id={doc.key}
                    type="file"
                    onChange={(e) => handleFileUpload(e, doc.key)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    // autoComplete="off"
                  />
                  <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors[doc.key]}</p>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Agreements */}
          <FormSection title="Final Agreements">
            <div className="space-y-4">
              <label className="flex items-start text-gray-700">
                <input
                  type="checkbox"
                  name="agreements"
                  checked={formData.agreements}
                  onChange={handleChange}
                  className="mt-1 mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  required
                  // autoComplete="off"
                />
                <span>I certify that all information provided is accurate and complete. <span className="text-red-500"> *</span></span>
              </label>
              <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.agreements}</p>
              <label className="flex items-start text-gray-700">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="mt-1 mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  required
                  // autoComplete="off"
                />
                <span>I agree to RoamEase's Terms & Conditions and Privacy Policy. <span className="text-red-500"> *</span></span>
              </label>
              <p className="text-red-500 text-xs mt-1 min-h-[1.25rem]">{errors.terms}</p>
            </div>
          </FormSection>

          <div className="text-center mt-10">
            <button
              type="submit"
              disabled={loading}
              className={`w-full max-w-sm py-3 px-8 rounded-lg text-white font-semibold text-xl transition-all duration-300 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
            <p className="text-red-500 text-sm mt-2 min-h-[1.25rem]">{error}</p>
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default SignupForm;
