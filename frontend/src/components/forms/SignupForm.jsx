import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useCallback, useRef
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { signupUser, clearError } from '../../redux/slices/authSlice';
import { toast } from 'react-hot-toast';
import PasswordInput from '../shared/PasswordInput';
import EmailVerificationPrompt from '../EmailVerificationPrompt';
import CountrySelect from '../shared/CountrySelect';
import { Truck, Ship, Plane, Train, MapPin, Warehouse, UserCircle, Shield, CheckCircle, Package } from 'lucide-react'; // Updated: Imported more icons
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
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    // User fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    country: '',
    role: ROLES.USER,
    // Logistics fields (no name/phoneNumber - using companyName/contactPhone instead)
    companyName: '',
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
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
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
  console.log(`Validating field: ${name}, value: "${value}", type: ${typeof value}, role: ${currentFormData.role}`);
  const role = currentFormData.role;

  // Required check
  if (!value && REQUIRED_FIELDS[role].includes(name)) {
    console.log(`Field ${name} is required but empty`);
    return 'This field is required';
  }

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
    console.log('Form data:', formData);
    console.log('Current role:', formData.role);
    
    // Clear any previous errors
    dispatch(clearError());
    
    const newErrors = {};
    const requiredFields = REQUIRED_FIELDS[formData.role];
    console.log('Required fields for role:', requiredFields);

    requiredFields.forEach((field) => {
      const passwordValueForValidation = formData.password;
      console.log(`Checking field: ${field}, value: "${formData[field]}"`);

      if (['services', 'regions'].includes(field)) {
        if (formData[field].length === 0) {
          console.log(`Field ${field} failed: must select at least one`);
          newErrors[field] = `Select at least one ${field}`;
        }
      } else if (['agreements', 'terms'].includes(field)) {
        if (!formData[field]) {
          console.log(`Field ${field} failed: must accept`);
          newErrors[field] = 'You must accept this';
        }
      } else if (['businessLicense', 'insuranceCertificate', 'governmentId'].includes(field)) {
        if (!formData.documents[field]) {
          console.log(`Field ${field} failed: document required`);
          newErrors[field] = 'Document is required';
        }
      } else {
        const msg = validateField(field, formData[field], formData, field === 'confirmPassword' ? passwordValueForValidation : null); // Pass formData and passwordValue
        if (msg) {
          console.log(`Field ${field} failed validation: ${msg}`);
          newErrors[field] = msg;
        } else {
          console.log(`Field ${field} passed validation`);
        }
      }
    });

    if (Object.keys(newErrors).length) {
      console.log('handleSubmit setting new errors:', newErrors);
      console.log('Form validation failed, preventing submission');
      setErrors(newErrors);
      return;
    }
    
    console.log('Form validation passed, proceeding with submission');

    console.log('handleSubmit clearing errors (no new errors)');
    setErrors({});

    try {
      let resultAction;

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

        resultAction = await dispatch(signupUser(payload));
    } else {
        resultAction = await dispatch(signupUser(formData));
      }

      // Handle the result
      if (signupUser.fulfilled.match(resultAction)) {
        // Registration successful and user is logged in
        const loggedInUser = resultAction.payload || {};
        const role = loggedInUser.role || "user";
        
        // Role-based navigation
        switch (role) {
          case "user":
            navigate("/user/dashboard");
            break;
          case "logistics":
            navigate("/logistics/dashboard");
            break;
          case "admin":
            navigate("/admin/dashboard");
            break;
          default:
            console.warn("Unknown role, redirecting to user dashboard:", role);
            navigate("/user/dashboard");
        }
      } else {
        const payload = resultAction.payload || {};
        
        // Check if email verification is required
        if (payload.needsVerification) {
          const email = payload.email || (formData.role === ROLES.USER ? formData.email : formData.contactEmail);
          setVerificationEmail(email);
          setShowVerificationPrompt(true);
          return;
        }
        
        // Handle other errors
        const msg = payload.message || resultAction.error?.message || 'Signup failed. Please try again.';
        console.error('Signup failed:', msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      toast.error(errorMessage);
    }
  }, [formData, dispatch, validateField, navigate]);

  const handleVerificationSuccess = () => {
    setShowVerificationPrompt(false);
    setVerificationEmail("");
    // Optionally redirect to login page
    navigate('/login');
  };

  const handleCloseVerification = () => {
    setShowVerificationPrompt(false);
    setVerificationEmail("");
  };

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
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Email Verification Prompt */}
        {showVerificationPrompt && (
          <div className="mb-8">
            <EmailVerificationPrompt
              email={verificationEmail}
              onVerified={handleVerificationSuccess}
              onClose={handleCloseVerification}
            />
          </div>
        )}
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join RoamEase
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with the world's leading logistics network. Choose your role and start your journey.
          </p>
        </div>

      {/* Role Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
        {Object.values(ROLES).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => switchRole(role)}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
              formData.role === role
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {role === ROLES.USER ? (
                  <>
                    <UserCircle className="w-5 h-5" />
                    Sign Up as User
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Sign Up as Logistics Provider
                  </>
                )}
          </button>
        ))}
          </div>
      </div>

        {/* Main Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <p className="text-indigo-100 text-center text-lg">
              {formData.role === ROLES.LOGISTICS 
                ? 'Join our network of trusted logistics providers' 
                : 'Start shipping and receiving with ease'
              }
            </p>
          </div>

          <div className="p-8">
      {formData.role === ROLES.USER ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <UserCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Personal Information</h3>
                  </div>
                  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                  autoComplete="off"
                />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                        type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.phoneNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                />
                      {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>
                </div>

                {/* Account Security */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Account Security</h3>
                  </div>
                  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordInput
                label="Password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                      error={errors.password}
              />
              <PasswordInput
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                      error={errors.confirmPassword}
              />
            </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
          <button
            type="submit"
                    disabled={loading}
                    onClick={(e) => {
                      console.log('User form button clicked!', e);
                      console.log('Loading state:', loading);
                      console.log('Form data:', formData);
                    }}
                    className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
          </button>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                  )}
                  
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors">
                      Sign in here
            </Link>
          </p>
                </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Company Information</h3>
                  </div>
                  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                        placeholder="Enter your company name"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.companyName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="yearsInOperation" className="block text-sm font-medium text-gray-700">
                        Years in Operation <span className="text-red-500">*</span>
                      </label>
                <input
                  id="yearsInOperation"
                  name="yearsInOperation"
                  type="number"
                  value={formData.yearsInOperation}
                  onChange={handleChange}
                        placeholder="e.g. 5"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.yearsInOperation ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.yearsInOperation && <p className="text-red-500 text-sm mt-1">{errors.yearsInOperation}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                        Registration Number <span className="text-red-500">*</span>
                      </label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                        placeholder="Enter registration number"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.registrationNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <CountrySelect
                  value={formData.country}
                        onChange={(value) => handleChange({ target: { name: 'country', value } })}
                        placeholder="Select country"
                        error={!!errors.country}
                        className="w-full"
                      />
                      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                        Company Size <span className="text-red-500">*</span>
                      </label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 ${
                          errors.companySize ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                  <option value="">Select size</option>
                  <option value="small">1-50 employees</option>
                  <option value="medium">51-200 employees</option>
                  <option value="large">201-500 employees</option>
                  <option value="enterprise">500+ employees</option>
                </select>
                      {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                        placeholder="https://www.example.com"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.website ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="fleetSize" className="block text-sm font-medium text-gray-700">
                        Fleet Size
                      </label>
                <input
                  id="fleetSize"
                  name="fleetSize"
                  type="number"
                  value={formData.fleetSize}
                  onChange={handleChange}
                        placeholder="Number of vehicles"
                  min="0"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.fleetSize ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                />
                      {errors.fleetSize && <p className="text-red-500 text-sm mt-1">{errors.fleetSize}</p>}
              </div>
            </div>
                </div>

                {/* Contact Person Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <UserCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Contact Person Information</h3>
                  </div>
                  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={handleChange}
                        placeholder="Enter contact person name"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.contactName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                        placeholder="Enter contact email"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.contactEmail ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                  autoComplete="off"
                />
                      {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contactPosition" className="block text-sm font-medium text-gray-700">
                        Contact Position <span className="text-red-500">*</span>
                      </label>
                <input
                  id="contactPosition"
                  name="contactPosition"
                  type="text"
                  value={formData.contactPosition}
                  onChange={handleChange}
                        placeholder="e.g. Operations Manager"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.contactPosition ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.contactPosition && <p className="text-red-500 text-sm mt-1">{errors.contactPosition}</p>}
              </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                        placeholder="Enter contact phone number"
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 ${
                          errors.contactPhone ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
              </div>
            </div>
                </div>

                {/* Account Security */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Account Security</h3>
                  </div>
                  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordInput
                label="Password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                      error={errors.password}
              />
              <PasswordInput
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                      error={errors.confirmPassword}
              />
            </div>
                </div>

                {/* Logistics Capabilities & Regions */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Logistics Capabilities & Regions</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Services */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-indigo-500" />
                        Transport Services <span className="text-red-500">*</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-xl">
                  {['Trucking', 'Shipping', 'Air Freight', 'Rail', 'Last-Mile Delivery', 'Warehousing'].map(
                    (service) => (
                            <label key={service} className="flex items-center text-gray-700 hover:bg-white dark:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name={`services-${service}`}
                          value={service}
                          checked={formData.services.includes(service)}
                          onChange={handleChange}
                                className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                              <span className="flex items-center gap-2">
                          {getServiceIcon(service)} {service}
                        </span>
                      </label>
                    )
                  )}
                </div>
                      {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
              </div>

              {/* Regions */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-500" />
                        Regions Served <span className="text-red-500">*</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-xl">
                  {['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'].map(
                    (region) => (
                            <label key={region} className="flex items-center text-gray-700 hover:bg-white dark:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name={`regions-${region}`}
                          value={region}
                          checked={formData.regions.includes(region)}
                          onChange={handleChange}
                                className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        {region}
                      </label>
                    )
                  )}
                </div>
                      {errors.regions && <p className="text-red-500 text-sm mt-1">{errors.regions}</p>}
              </div>
            </div>
                </div>

                {/* Required Documents */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Required Documents</h3>
                  </div>
                  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Business License', key: 'businessLicense' },
                { label: 'Insurance Certificate', key: 'insuranceCertificate' },
                { label: 'Government ID', key: 'governmentId' },
              ].map((doc) => (
                      <div key={doc.key} className="space-y-2">
                        <label htmlFor={doc.key} className="block text-sm font-medium text-gray-700">
                          {doc.label} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                  <input
                    id={doc.key}
                    type="file"
                    onChange={(e) => handleFileUpload(e, doc.key)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-50 file:to-purple-50 file:text-indigo-700 hover:file:from-indigo-100 hover:file:to-purple-100 cursor-pointer border border-gray-300 rounded-xl p-2"
                  />
                        </div>
                        {errors[doc.key] && <p className="text-red-500 text-sm mt-1">{errors[doc.key]}</p>}
                </div>
              ))}
            </div>
                </div>

                {/* Final Agreements */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Final Agreements</h3>
                  </div>
                  
                  <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="flex items-start text-gray-700 hover:bg-white dark:bg-gray-800 p-3 rounded-lg transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="agreements"
                  checked={formData.agreements}
                  onChange={handleChange}
                        className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  required
                />
                      <span className="text-sm">
                        I certify that all information provided is accurate and complete. <span className="text-red-500">*</span>
                      </span>
              </label>
                    {errors.agreements && <p className="text-red-500 text-sm mt-1">{errors.agreements}</p>}
                    
                    <label className="flex items-start text-gray-700 hover:bg-white dark:bg-gray-800 p-3 rounded-lg transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                        className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  required
                />
                      <span className="text-sm">
                        I agree to RoamEase's Terms & Conditions and Privacy Policy. <span className="text-red-500">*</span>
                      </span>
              </label>
                    {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
            </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
            </button>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                  )}
                  
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors">
                      Sign in here
              </Link>
            </p>
          </div>
        </form>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
