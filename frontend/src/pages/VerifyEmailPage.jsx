import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, ArrowLeft, Loader2, Mail } from 'lucide-react';
import VerificationCodeInput from '../components/VerificationCodeInput';
import api from '../services/api';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  // Get email from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleCodeComplete = async (code) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/verify', { code });
      
      if (response.data.success !== false) {
        setSuccess(true);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorMessage = response.data.message || 'Verification failed';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification code sent!');
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend code';
      toast.error(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
          <p className="text-gray-600">
            Your email has been successfully verified. You can now log in to your account.
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
          <div className="mx-auto h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit verification code sent to your email address
          </p>
          {email && (
            <p className="mt-1 text-sm font-medium text-indigo-600">
              {email}
            </p>
          )}
        </div>

        {/* Verification Code Input */}
        <div className="mt-8 space-y-6">
          <VerificationCodeInput
            length={6}
            onComplete={handleCodeComplete}
            loading={loading}
            error={error}
            success={success}
          />

          {/* Email Input for Resend */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (for resending code)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={location.state?.email}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  location.state?.email ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter your email address"
              />
            </div>
            
            <button
              onClick={handleResendCode}
              disabled={!email || loading}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {error && (
              <button
                onClick={handleRetry}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            )}
            
            {location.state?.fromSignup ? (
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Signup
              </button>
            ) : (
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;