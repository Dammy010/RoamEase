# 🚀 React + Redux API Call Optimization Guide

## 🎯 Problem Solved

This implementation fixes the **429 (Too Many Requests)** errors caused by duplicate API calls in your React + Redux frontend.

## 🔧 Key Features

### ✅ **Smart Caching System**

- **5-minute cache** for profile and settings data
- **2-minute cache** for shipment data (shorter due to frequent updates)
- **Automatic cache invalidation** when data changes
- **Cache status tracking** for debugging

### ✅ **Duplicate Request Prevention**

- **Prevents multiple components** from fetching the same data simultaneously
- **Waits for ongoing requests** instead of starting new ones
- **Smart loading state management**

### ✅ **Custom Hooks for Easy Usage**

- `useProfile()` - Profile data with caching
- `useSettings()` - Settings data with caching
- `useUserShipments()` - User shipments with caching
- `useDeliveredShipments()` - Delivered shipments with caching
- `useShipmentById(id)` - Specific shipment with caching

## 📁 Files Updated

### 1. **Enhanced Redux Slices**

- `frontend/src/redux/slices/authSlice.js` - Profile caching
- `frontend/src/redux/slices/settingsSlice.js` - Settings caching
- `frontend/src/redux/slices/shipmentSlice.js` - Shipment caching

### 2. **Custom Hooks**

- `frontend/src/hooks/useApiCall.js` - Generic API call hook
- `frontend/src/components/examples/OptimizedComponents.jsx` - Usage examples

## 🚀 How to Use

### **Before (❌ Causing 429 Errors)**

```jsx
// BAD: Multiple components fetching same data
const ProfileComponent = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile()); // Called every time component mounts
  }, [dispatch]);

  // ... rest of component
};

const SettingsComponent = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.settings);

  useEffect(() => {
    dispatch(getSettings()); // Called every time component mounts
  }, [dispatch]);

  // ... rest of component
};
```

### **After (✅ Optimized)**

```jsx
// GOOD: Smart caching prevents duplicate calls
const ProfileComponent = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Use custom hook with caching
  const { data: profileData } = useProfile();

  // Only fetch if we don't have data
  useEffect(() => {
    if (!user && !loading) {
      console.log("🔍 ProfileComponent: Fetching profile data");
      dispatch(fetchProfile());
    } else if (user) {
      console.log("📦 ProfileComponent: Using existing profile data");
    }
  }, [dispatch, user, loading]);

  // ... rest of component
};
```

## 🔍 Cache Debugging

### **Console Logs**

The system provides detailed console logs:

```
📦 Using cached profile data
⏳ Profile fetch already in progress, waiting...
🌐 Fetching fresh profile data from API
🚫 API call disabled for auth/fetchProfile
```

### **Cache Status in Redux State**

```javascript
// Check cache status in Redux DevTools
state.auth.cacheStatus = {
  profile: {
    isValid: true,
    lastFetched: 1703123456789,
  },
};
```

### **Manual Cache Clearing**

```javascript
// Clear cache manually (for debugging)
dispatch(clearCache()); // Clears all caches
dispatch(clearCache("profile")); // Clears specific cache
```

## 📊 Performance Benefits

### **Before Optimization**

- ❌ **Multiple API calls** for same data
- ❌ **429 Too Many Requests** errors
- ❌ **Slow loading** due to redundant requests
- ❌ **Poor user experience**

### **After Optimization**

- ✅ **Single API call** per data type
- ✅ **No 429 errors** on deployed backend
- ✅ **Faster loading** with cached data
- ✅ **Better user experience**

## 🎯 Common Use Cases

### **1. Profile Data**

```jsx
const ProfilePage = () => {
  const { data: profileData } = useProfile();

  // Profile data is cached for 5 minutes
  // Multiple components can use this without duplicate calls
};
```

### **2. Settings Data**

```jsx
const SettingsPage = () => {
  const { data: settingsData } = useSettings();

  // Settings data is cached for 5 minutes
  // Only refetches when settings are updated
};
```

### **3. Shipment Data**

```jsx
const ShipmentsPage = () => {
  const { data: shipmentsData } = useUserShipments();

  // Shipment data is cached for 2 minutes
  // Automatically refreshes when shipments change
};
```

### **4. Force Refresh After Actions**

```jsx
const ShipmentActions = () => {
  const { data: shipmentsData } = useUserShipments();

  const handleUpdateShipment = async (id, status) => {
    await dispatch(updateShipmentStatus({ id, status }));

    // Force refresh after update
    dispatch(fetchUserShipments());
  };
};
```

## 🔧 Configuration

### **Cache Duration**

```javascript
// In each slice file
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for profile/settings
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for shipments
```

### **Custom Cache Duration**

```javascript
// You can modify cache duration per slice
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for rarely changing data
const CACHE_DURATION = 30 * 1000; // 30 seconds for frequently changing data
```

## 🚨 Important Notes

### **Cache Invalidation**

- **Automatic**: Cache is cleared when data is updated
- **Manual**: Use `clearCache()` action for debugging
- **Login/Logout**: All caches are cleared on authentication changes

### **Error Handling**

- **Network errors**: Cache is not used, fresh data is fetched
- **429 errors**: Should be eliminated with this implementation
- **Loading states**: Properly managed to prevent duplicate calls

### **Backend Compatibility**

- **Works with existing API endpoints**
- **No backend changes required**
- **Compatible with rate limiting**

## 🎉 Expected Results

After implementing this optimization:

1. **✅ No more 429 errors** on your deployed backend
2. **✅ Faster page loads** with cached data
3. **✅ Reduced server load** with fewer API calls
4. **✅ Better user experience** with consistent data
5. **✅ Detailed logging** for debugging

## 🔍 Monitoring

### **Check Console Logs**

Look for these patterns:

- `📦 Using cached data` - Cache hit
- `🌐 Fetching fresh data` - Cache miss
- `⏳ Already fetching` - Duplicate prevention working

### **Redux DevTools**

Monitor cache status in Redux state:

```javascript
state.auth.cacheStatus.profile.isValid; // true/false
state.auth.cacheStatus.profile.lastFetched; // timestamp
```

This implementation ensures your React frontend makes minimal, efficient API calls while maintaining data freshness and user experience! 🚀
