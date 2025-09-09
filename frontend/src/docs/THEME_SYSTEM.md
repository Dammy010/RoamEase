# Centralized Theme System

This document explains how to use the centralized theme system in the RoamEase application.

## Overview

The theme system provides a centralized way to manage light/dark/system themes across the entire application. It uses React Context API and localStorage for persistence.

## Key Features

- ✅ **Centralized Management**: Single source of truth for theme state
- ✅ **Three Theme Modes**: Light, Dark, and System (follows OS preference)
- ✅ **Persistent Storage**: Theme choice saved in localStorage
- ✅ **System Theme Detection**: Automatically detects and follows OS theme changes
- ✅ **Tailwind Integration**: Works seamlessly with Tailwind's `dark:` classes
- ✅ **Easy to Use**: Simple hooks and components for theme management

## Architecture

```
ThemeProvider (Context)
├── ThemeContext.jsx (Main context and provider)
├── ThemeToggle.jsx (Reusable toggle component)
├── useTheme.js (Custom hook with utilities)
└── App.jsx (Wrapped with ThemeProvider)
```

## Usage

### 1. Basic Theme-Aware Styling

Use Tailwind's `dark:` classes for automatic theme switching:

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  This automatically switches between light and dark themes
</div>
```

### 2. Using the Theme Hook

```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, isDark, isLight, isSystem, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Is dark mode: {isDark ? 'Yes' : 'No'}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### 3. Using the Theme Toggle Component

```jsx
import ThemeToggle from '../components/shared/ThemeToggle';

const MyComponent = () => {
  return (
    <div>
      {/* Basic toggle */}
      <ThemeToggle />
      
      {/* Toggle with label */}
      <ThemeToggle showLabel={true} />
      
      {/* Small toggle */}
      <ThemeToggle size="sm" />
      
      {/* Custom styling */}
      <ThemeToggle className="custom-class" />
    </div>
  );
};
```

### 4. Conditional Rendering

```jsx
const MyComponent = () => {
  const { isDark, theme } = useTheme();
  
  return (
    <div>
      {isDark ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
      
      {theme === 'system' && (
        <p>Using system preference</p>
      )}
    </div>
  );
};
```

## Theme Modes

### Light Mode
- Default theme
- Clean, bright interface
- Good for daytime use

### Dark Mode
- Dark background with light text
- Easier on the eyes in low light
- Modern, sleek appearance

### System Mode
- Follows the operating system's theme preference
- Automatically switches when OS theme changes
- Best for users who want consistency with their OS

## Theme Cycling

The theme toggle cycles through modes in this order:
1. Light → Dark
2. Dark → System
3. System → Light

## Implementation Details

### ThemeProvider
- Manages theme state using React Context
- Handles localStorage persistence
- Listens for system theme changes
- Prevents hydration mismatches

### ThemeContext
- Provides theme state and functions
- Handles theme application to document.documentElement
- Manages system theme detection

### ThemeToggle Component
- Reusable toggle button
- Shows current theme with appropriate icon
- Supports different sizes and labels
- Accessible with proper ARIA labels

## Best Practices

### 1. Always Use Tailwind Dark Classes
```jsx
// ✅ Good
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// ❌ Avoid
<div className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>
```

### 2. Use the Theme Hook for Logic
```jsx
// ✅ Good
const { isDark } = useTheme();
{isDark ? <MoonIcon /> : <SunIcon />}

// ❌ Avoid
{theme === 'dark' ? <MoonIcon /> : <SunIcon />}
```

### 3. Use ThemeToggle Component
```jsx
// ✅ Good
<ThemeToggle showLabel={true} />

// ❌ Avoid
<button onClick={toggleTheme}>Toggle</button>
```

### 4. Test All Theme Modes
- Test with light mode
- Test with dark mode
- Test with system mode
- Test system theme changes

## Migration from Old System

If you have existing theme code, here's how to migrate:

### Before (Redux-based)
```jsx
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../redux/slices/settingsSlice';

const MyComponent = () => {
  const theme = useSelector(state => state.settings.settings.theme);
  const dispatch = useDispatch();
  
  const handleToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };
};
```

### After (Context-based)
```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  // No need for custom toggle logic
};
```

## Troubleshooting

### Theme Not Persisting
- Check if localStorage is available
- Ensure ThemeProvider wraps your app
- Verify theme is being saved to localStorage

### Hydration Mismatch
- ThemeProvider handles this automatically
- Don't access theme before component mounts

### System Theme Not Working
- Check if `window.matchMedia` is available
- Ensure system theme listener is properly set up
- Test on different browsers

### Styling Not Updating
- Make sure you're using `dark:` classes
- Check if `dark` class is applied to document.documentElement
- Verify Tailwind config has `darkMode: 'class'`

## Examples

See `frontend/src/examples/ThemeUsageExample.jsx` for comprehensive usage examples.

## API Reference

### useTheme Hook
```jsx
const {
  theme,        // 'light' | 'dark' | 'system'
  isDark,       // boolean - true if currently dark
  isLight,      // boolean - true if currently light
  isSystem,     // boolean - true if using system theme
  toggleTheme,  // function - cycles through themes
  setTheme      // function - sets specific theme
} = useTheme();
```

### ThemeToggle Component Props
```jsx
<ThemeToggle
  className="string"    // Additional CSS classes
  showLabel={boolean}   // Show theme label
  size="sm|default"     // Toggle size
/>
```
