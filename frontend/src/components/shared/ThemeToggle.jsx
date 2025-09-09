import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle = ({ className = '', showLabel = false, size = 'default' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const getIcon = () => {
    if (isDark) {
      return <Moon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-indigo-500`} />;
    } else if (theme === 'system') {
      return <Monitor className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />;
    } else {
      return <Sun className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-500`} />;
    }
  };

  const getLabel = () => {
    if (isDark && theme !== 'system') {
      return 'Dark';
    } else if (theme === 'system') {
      return 'System';
    } else {
      return 'Light';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
    >
      {getIcon()}
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getLabel()}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
