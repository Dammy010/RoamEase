# Real-time Shipment Tracking Feature

This document describes the implementation of real-time live tracking for shipments after a user accepts a logistics bid.

## Overview

The tracking system allows users to track their shipments in real-time on a map with live updates from logistics companies. It includes both backend API endpoints and frontend components for a complete tracking experience.

## Features

### Backend Features

- **Location Updates**: POST endpoint for logistics companies to send GPS coordinates
- **Real-time Broadcasting**: Socket.IO integration for instant location updates
- **Security**: JWT authentication and rate limiting (1 update per 5 seconds)
- **Reverse Geocoding**: Automatic address resolution using OpenStreetMap
- **Location History**: Complete trail of shipment locations
- **Permission Control**: Only authorized users can track/update locations

### Frontend Features

- **Interactive Map**: Leaflet + OpenStreetMap integration
- **Real-time Updates**: Live location updates via Socket.IO
- **Driver Information**: Contact details and vehicle information
- **Route Visualization**: Polyline showing shipment path
- **Offline Handling**: Graceful degradation when connection is lost
- **Auto-reconnect**: Automatic reconnection on connection loss
- **Location Controls**: Manual location updates for logistics companies

## API Endpoints

### Location Tracking

- `POST /api/shipments/:id/location` - Update shipment location (logistics only)
- `GET /api/shipments/:id/tracking` - Get tracking data
- `POST /api/shipments/:id/start-tracking` - Start tracking (logistics only)
- `POST /api/shipments/:id/stop-tracking` - Stop tracking (logistics only)

### Socket.IO Events

- `join-shipment-tracking` - Join tracking room for a shipment
- `leave-shipment-tracking` - Leave tracking room
- `locationUpdate` - Real-time location update
- `trackingStarted` - Tracking started notification
- `trackingStopped` - Tracking stopped notification

## Database Schema

### Shipment Model Updates

```javascript
{
  // Real-time Location Tracking
  lastLocation: {
    lat: Number,
    lng: Number,
    speed: Number, // km/h
    heading: Number, // degrees
    timestamp: Date,
    address: String // Reverse geocoded address
  },
  locationHistory: [{
    lat: Number,
    lng: Number,
    speed: Number,
    heading: Number,
    timestamp: Date,
    address: String
  }],
  isTrackingActive: Boolean,
  trackingStartedAt: Date,
  trackingEndedAt: Date
}
```

## Frontend Components

### ShipmentTracking.jsx

Main tracking component with map, driver info, and controls.

**Features:**

- Interactive map with Leaflet
- Real-time location updates
- Driver information display
- Route polyline visualization
- Follow driver toggle
- Location history
- Auto-reconnect functionality

### LogisticsLocationUpdater.jsx

Component for logistics companies to update their location.

**Features:**

- GPS location detection
- Manual location updates
- Speed and heading display
- Auto-update when tracking is active
- Connection status indicator

### useShipmentTracking.js

Custom hook for managing tracking state and Socket.IO connections.

**Features:**

- Socket connection management
- Real-time data updates
- Auto-reconnect logic
- Error handling
- Location update functions

## Usage

### For Users (Shipment Owners)

1. Navigate to shipment details page
2. Click "Track Shipment" button (only available for accepted shipments)
3. View real-time location on map
4. See driver information and contact details
5. Toggle "Follow Driver" to auto-center map

### For Logistics Companies

1. Go to Active Shipments page
2. Use Location Tracking section to update location
3. Enable automatic location updates
4. Monitor connection status

## Security Features

### Rate Limiting

- Location updates limited to 1 per 5 seconds per user/shipment
- Prevents spam and abuse

### Authentication

- JWT token required for all tracking endpoints
- Socket.IO connections authenticated with JWT
- Permission checks for shipment access

### Permission Control

- Only shipment owners can view tracking
- Only assigned logistics companies can update location
- Admin users have full access

## Installation

### Backend Dependencies

```bash
npm install express-rate-limit axios
```

### Frontend Dependencies

```bash
npm install leaflet react-leaflet
```

## Configuration

### Environment Variables

```env
# Socket.IO configuration
CLIENT_URL=http://localhost:5173

# JWT secret for authentication
JWT_SECRET=your_jwt_secret
```

### Rate Limiting Configuration

```javascript
// Location update rate limit: 1 update per 5 seconds
const locationUpdateRateLimit = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1, // 1 request per window
  keyGenerator: (req) => `location_update:${req.user._id}:${req.params.id}`,
});
```

## Testing

### Test Page

A test page is available at `/test-tracking` for development and testing purposes.

### Manual Testing

1. Create a shipment
2. Accept a bid (logistics company)
3. Use the tracking modal to view real-time updates
4. Use the location updater to send location updates

## Error Handling

### Backend Errors

- Invalid coordinates validation
- Permission denied for unauthorized access
- Rate limit exceeded notifications
- Database connection errors

### Frontend Errors

- Geolocation API errors
- Socket connection failures
- Map loading errors
- Network timeout handling

## Performance Considerations

### Backend

- Rate limiting prevents excessive updates
- Location history stored efficiently
- Reverse geocoding cached to reduce API calls

### Frontend

- Map updates optimized for smooth rendering
- Socket reconnection with exponential backoff
- Location history limited to recent updates
- Efficient state management with React hooks

## Future Enhancements

### Planned Features

- ETA calculation using routing services
- Push notifications for location updates
- Offline map caching
- Multiple vehicle tracking
- Geofencing alerts
- Delivery confirmation with location

### Integration Options

- Google Maps API for enhanced routing
- Mapbox for custom map styles
- Firebase for push notifications
- Redis for real-time data caching

## Troubleshooting

### Common Issues

1. **Map not loading**

   - Check Leaflet CSS import
   - Verify internet connection
   - Check browser console for errors

2. **Location updates not working**

   - Verify GPS permissions
   - Check Socket.IO connection
   - Ensure user has proper permissions

3. **Rate limit errors**
   - Wait 5 seconds between updates
   - Check rate limiting configuration
   - Verify user authentication

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in backend environment.

## Support

For issues or questions regarding the tracking feature:

1. Check the browser console for errors
2. Verify backend logs for API issues
3. Test with the provided test page
4. Check network connectivity and permissions
