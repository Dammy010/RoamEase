import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/shared/ThemeToggle';

/**
 * Example component showing how to use the centralized theme system
 * This demonstrates all the ways you can access and use theme in your components
 */
const ThemeUsageExample = () => {
  const { theme, isDark, isLight, isSystem, toggleTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Theme System Usage Examples
        </h1>

        {/* Example 1: Basic theme-aware styling */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Example 1: Basic Theme-Aware Styling
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            This card automatically adapts to the current theme using Tailwind's dark: classes.
          </p>
        </div>

        {/* Example 2: Conditional rendering based on theme */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Example 2: Conditional Rendering
          </h2>
          {isDark ? (
            <p className="text-green-400">🌙 You're in dark mode!</p>
          ) : (
            <p className="text-blue-600">☀️ You're in light mode!</p>
          )}
          {isSystem && (
            <p className="text-purple-500 mt-2">🖥️ Using system preference</p>
          )}
        </div>

        {/* Example 3: Theme toggle components */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Example 3: Theme Toggle Components
          </h2>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <ThemeToggle showLabel={true} />
            <ThemeToggle size="sm" />
          </div>
        </div>

        {/* Example 4: Programmatic theme control */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Example 4: Programmatic Theme Control
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Set Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Set System
            </button>
          </div>
        </div>

        {/* Example 5: Current theme info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Example 5: Current Theme Information
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>Current Theme:</strong> <span className="text-blue-600 dark:text-blue-400">{theme}</span></p>
            <p><strong>Is Dark:</strong> <span className="text-blue-600 dark:text-blue-400">{isDark ? 'Yes' : 'No'}</span></p>
            <p><strong>Is Light:</strong> <span className="text-blue-600 dark:text-blue-400">{isLight ? 'Yes' : 'No'}</span></p>
            <p><strong>Is System:</strong> <span className="text-blue-600 dark:text-blue-400">{isSystem ? 'Yes' : 'No'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeUsageExample;
