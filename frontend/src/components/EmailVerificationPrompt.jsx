import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { resendVerificationEmail, checkVerificationStatus } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const EmailVerificationPrompt = ({ email, onVerified, onClose }) => {
  const dispatch = useDispatch();
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const { loading } = useSelector((state) => state.auth);

  // Check verification status when component mounts
  useEffect(() => {
    if (email) {
      checkStatus();
    }
  }, [email]);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const result = await dispatch(checkVerificationStatus(email));
      if (result.payload) {
        const { isVerified, canResend: canResendStatus, timeLeft: remainingTime } = result.payload;
        
        if (isVerified) {
          onVerified?.(result.payload);
          return;
        }
        
        setCanResend(canResendStatus);
        if (remainingTime) {
          setTimeLeft(remainingTime);
        }
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    try {
      const result = await dispatch(resendVerificationEmail(email));
      if (result.type.endsWith('fulfilled')) {
        setCanResend(false);
        // Start countdown if there's a retry limit
        if (result.payload?.retryAfter) {
          startCountdown(result.payload.retryAfter);
        }
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const startCountdown = (minutes) => {
    let timeLeft = minutes;
    setTimeLeft(timeLeft);
    
    const timer = setInterval(() => {
      timeLeft -= 1;
      setTimeLeft(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        setTimeLeft(null);
        setCanResend(true);
      }
    }, 60000); // Update every minute
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Checking verification status...</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            Verify Your Email Address
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit verification code to <strong>{email}</strong>. 
              Please check your email and enter the code to verify your account.
            </p>
            <div className="mt-3 bg-blue-100 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-2">Next steps:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your email inbox for the 6-digit code</li>
                <li>• Go to the verification page</li>
                <li>• Enter the verification code</li>
                <li>• Complete your account setup</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <Link
              to="/verify-email"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center block"
            >
              Go to Verification Page
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleResend}
                disabled={!canResend || isResending || loading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  canResend && !isResending && !loading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isResending ? 'Sending...' : 
                 timeLeft ? `Resend in ${formatTimeRemaining(timeLeft)}` : 
                 'Resend Verification Email'}
              </button>
              
              <button
                onClick={checkStatus}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Check Status
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  Close
                </button>
              )}
            </div>
          </div>
          
          {timeLeft && (
            <p className="mt-2 text-xs text-gray-500">
              Current verification code expires in {formatTimeRemaining(timeLeft)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPrompt;
