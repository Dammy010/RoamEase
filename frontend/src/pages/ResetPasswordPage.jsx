import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Loader2, Key } from 'lucide-react';
import VerificationCodeInput from '../components/VerificationCodeInput';
import api from '../services/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Enter code, 2: Reset password
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get email from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCodeComplete = async (enteredCode) => {
    setCode(enteredCode);
    setLoading(true);
    setErrors({});

    try {
      // Validate the code using the dedicated validation endpoint
      const response = await api.post('/auth/validate-reset-code', {
        code: enteredCode
      });

      // If we get here, the code is valid
      if (response.data.success) {
        setStep(2);
      }
    } catch (err) {
      // Code is invalid or expired
      const errorMessage = err.response?.data?.message || 'Invalid or expired code';
      setErrors({ code: errorMessage });
      setCode('');
      
      // Reset the verification code input
      setTimeout(() => {
        setErrors({});
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/reset-password', {
        code,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      
      // If code is invalid, go back to step 1
      if (err.response?.data?.code === 'INVALID_OR_EXPIRED_CODE') {
        setStep(1);
        setCode('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCode = () => {
    setStep(1);
    setCode('');
    setFormData({ password: '', confirmPassword: '' });
    setErrors({});
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Password Reset Successfully!</h2>
          <p className="text-gray-600">
            Your password has been updated. You can now log in with your new password.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleGoToLogin}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
            <p className="text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
            {step === 1 ? <Key className="h-5 w-5 text-white" /> : <Lock className="h-5 w-5 text-white" />}
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            {step === 1 ? 'Enter Reset Code' : 'Reset Your Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 
              ? 'Enter the 6-digit code sent to your email address'
              : 'Enter your new password below'
            }
          </p>
          {email && (
            <p className="mt-1 text-sm font-medium text-indigo-600">
              {email}
            </p>
          )}
        </div>

        {/* Step 1: Enter Code */}
        {step === 1 && (
          <div className="mt-8 space-y-6">
            <VerificationCodeInput
              length={6}
              onComplete={handleCodeComplete}
              loading={loading}
              error={errors.code}
              success={false}
            />

            <div className="space-y-4">
              {errors.code && (
                <button
                  onClick={() => {
                    setErrors({});
                    setCode('');
                  }}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigate(location.state?.fromForgotPassword ? '/forgot-password' : '/login')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {location.state?.fromForgotPassword ? 'Back to Forgot Password' : 'Back to Login'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Reset Password */}
        {step === 2 && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToCode}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Code Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;