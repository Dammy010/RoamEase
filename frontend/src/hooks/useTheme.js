import { useTheme as useThemeContext } from '../contexts/ThemeContext';

/**
 * Custom hook for theme management
 * Provides easy access to theme state and utilities
 */
export const useTheme = () => {
  const themeContext = useThemeContext();
  
  return {
    ...themeContext,
    // Additional utility functions
    getThemeIcon: () => {
      switch (themeContext.theme) {
        case 'dark':
          return 'moon';
        case 'system':
          return 'monitor';
        default:
          return 'sun';
      }
    },
    getThemeLabel: () => {
      switch (themeContext.theme) {
        case 'dark':
          return 'Dark';
        case 'system':
          return 'System';
        default:
          return 'Light';
      }
    },
    isSystemTheme: themeContext.theme === 'system',
    isDarkTheme: themeContext.theme === 'dark',
    isLightTheme: themeContext.theme === 'light'
  };
};

export default useTheme;
