import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerificationCodeInput = ({ 
  length = 6, 
  onComplete, 
  loading = false, 
  error = null,
  success = false,
  disabled = false 
}) => {
  const [code, setCode] = useState(Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (success) {
      setCode(Array(length).fill(''));
      setActiveIndex(0);
    }
  }, [success, length]);

  const handleChange = (index, value) => {
    if (disabled || loading) return;

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if current is filled
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all inputs are filled
    const isComplete = newCode.every(digit => digit !== '');
    if (isComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled || loading) return;

    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input if current is empty
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    if (disabled || loading) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length > 0) {
      const newCode = Array(length).fill('');
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, length - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      
      // Check if complete
      if (pastedData.length === length) {
        onComplete(pastedData);
      }
    }
  };

  const getInputStyle = (index) => {
    let baseStyle = "w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200";
    
    if (disabled || loading) {
      baseStyle += " bg-gray-100 border-gray-300 cursor-not-allowed";
    } else if (error) {
      baseStyle += " border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50";
    } else if (success) {
      baseStyle += " border-green-300 bg-green-50";
    } else if (index === activeIndex) {
      baseStyle += " border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500";
    } else if (code[index]) {
      baseStyle += " border-indigo-300 bg-indigo-50";
    } else {
      baseStyle += " border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
    }
    
    return baseStyle;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Code Input */}
      <div className="flex space-x-2">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            value={code[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            className={getInputStyle(index)}
            disabled={disabled || loading}
            autoComplete="off"
          />
        ))}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center space-x-2">
        {loading && (
          <div className="flex items-center space-x-2 text-indigo-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Verifying...</span>
          </div>
        )}
        
        {success && !loading && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Verified!</span>
          </div>
        )}
        
        {error && !loading && (
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!loading && !success && !error && (
        <p className="text-sm text-gray-500 text-center">
          Enter the 6-digit code sent to your email
        </p>
      )}
    </div>
  );
};

export default VerificationCodeInput;
