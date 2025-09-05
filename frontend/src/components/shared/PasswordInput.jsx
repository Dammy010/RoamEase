import React, { useState, memo } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Assuming lucide-react is installed

const PasswordInput = memo(({ label, id, required, name, errors, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const baseInputClasses = "w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out text-gray-800 pr-10";
  const errorClass = errors?.[name] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300';
  const finalInputClasses = `${baseInputClasses} ${errorClass} ${props.className || ''}`;

  return (
    <div className="mb-5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          {...props}
          name={name} // Ensure name is passed to the input element
          className={finalInputClasses}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
});

export default PasswordInput;
