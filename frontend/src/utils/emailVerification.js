import api from '../services/api';

/**
 * Email Verification Utility Functions
 * Provides easy-to-use functions for frontend email verification integration
 */

// Check verification status for an email
export const checkVerificationStatus = async (email) => {
  try {
    const response = await api.get(`/auth/verification-status?email=${encodeURIComponent(email)}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to check verification status',
      code: error.response?.data?.code
    };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to resend verification email',
      code: error.response?.data?.code,
      retryAfter: error.response?.data?.retryAfter
    };
  }
};

// Verify email with token (usually called from verification page)
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/auth/verify/${token}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to verify email',
      code: error.response?.data?.code
    };
  }
};

// Handle login response for email verification
export const handleLoginResponse = (response) => {
  const data = response.data;
  
  if (data.isVerified === false) {
    return {
      needsVerification: true,
      email: data.email,
      message: data.message || 'Please verify your email address before logging in.'
    };
  }
  
  return {
    needsVerification: false,
    user: data
  };
};

// Handle registration response for email verification
export const handleRegistrationResponse = (response) => {
  const data = response.data;
  
  if (data.message && data.message.includes('verify your account')) {
    return {
      needsVerification: true,
      email: data.email,
      message: data.message
    };
  }
  
  return {
    needsVerification: false,
    user: data
  };
};

// Get user-friendly error messages
export const getErrorMessage = (code) => {
  const errorMessages = {
    'USER_NOT_FOUND': 'No account found with this email address.',
    'ALREADY_VERIFIED': 'This email is already verified.',
    'TOO_MANY_REQUESTS': 'Please wait before requesting another verification email.',
    'EMAIL_SEND_FAILED': 'Failed to send verification email. Please try again later.',
    'EMAIL_VERIFICATION_REQUIRED': 'Please verify your email to access this feature.',
    'INVALID_TOKEN': 'Invalid or expired verification link.',
    'INTERNAL_ERROR': 'Something went wrong. Please try again.'
  };
  
  return errorMessages[code] || 'An unexpected error occurred.';
};

// Format time remaining for countdown
export const formatTimeRemaining = (timeString) => {
  if (!timeString) return null;
  
  const match = timeString.match(/(\d+)\s+minutes?/);
  if (match) {
    const minutes = parseInt(match[1]);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
    }
  }
  
  return timeString;
};

// React hook for email verification (if using React)
export const useEmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const checkStatus = async (email) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    const result = await checkVerificationStatus(email);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
    return result;
  };

  const resendEmail = async (email) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    const result = await resendVerificationEmail(email);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
    return result;
  };

  const verifyEmail = async (token) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    const result = await verifyEmail(token);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
    return result;
  };

  return {
    isLoading,
    error,
    success,
    checkStatus,
    resendEmail,
    verifyEmail,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
};

// Example React component for email verification
export const EmailVerificationComponent = ({ email, onVerified }) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (email) {
      checkStatus();
    }
  }, [email]);

  const checkStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await checkVerificationStatus(email);
    
    if (result.success) {
      setStatus(result.data);
      if (result.data.isVerified) {
        onVerified?.(result.data);
      }
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    const result = await resendVerificationEmail(email);
    
    if (result.success) {
      setSuccess(true);
      setStatus(result.data);
      // Start countdown if there's a retry limit
      if (result.data.retryAfter) {
        startCountdown(result.data.retryAfter);
      }
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const startCountdown = (minutes) => {
    let timeLeft = minutes;
    setCountdown(timeLeft);
    
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        setCountdown(null);
      }
    }, 60000); // Update every minute
  };

  if (!email) return null;

  return (
    <div className="email-verification">
      {isLoading && <div>Loading...</div>}
      
      {error && (
        <div className="error">
          {getErrorMessage(error)}
        </div>
      )}
      
      {success && (
        <div className="success">
          Verification email sent! Please check your inbox.
        </div>
      )}
      
      {status && !status.isVerified && (
        <div className="verification-prompt">
          <h3>Verify Your Email</h3>
          <p>We've sent a verification link to {email}</p>
          
          <button 
            onClick={handleResend}
            disabled={isLoading || !status.canResend || countdown > 0}
            className="resend-button"
          >
            {isLoading ? 'Sending...' : 
             countdown ? `Resend in ${countdown} min` : 
             'Resend Verification Email'}
          </button>
          
          {status.timeLeft && (
            <p className="time-left">
              Current link expires in {formatTimeRemaining(status.timeLeft)}
            </p>
          )}
        </div>
      )}
      
      {status && status.isVerified && (
        <div className="verified">
          ✅ Email verified successfully!
        </div>
      )}
    </div>
  );
};

// Default export for easy importing
export default {
  checkVerificationStatus,
  resendVerificationEmail,
  verifyEmail,
  handleLoginResponse,
  handleRegistrationResponse,
  getErrorMessage,
  formatTimeRemaining,
  useEmailVerification,
  EmailVerificationComponent
};
