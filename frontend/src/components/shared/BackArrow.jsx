import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BackArrow = ({ 
  to = null, 
  onClick = null, 
  className = "",
  showText = true,
  text = "Back",
  variant = "default" // default, minimal, icon-only
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back in browser history
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";
      case 'icon-only':
        return "p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";
      default:
        return "inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200";
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`${getVariantStyles()} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <ArrowLeft className="w-4 h-4" />
      {showText && variant !== 'icon-only' && (
        <span className="font-medium">{text}</span>
      )}
    </motion.button>
  );
};

export default BackArrow;
