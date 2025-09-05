import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles);

  if (!user) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Check if there are specific roles allowed for this route
  if (allowedRoles && allowedRoles.length > 0) {
    // If user's role is not in the allowedRoles array, redirect to unauthorized or dashboard
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={`/${user.role}/dashboard`} replace />;
    }
  }

  // User is authenticated and has an allowed role (or no specific roles are required)
  return <Outlet />;
};

export default ProtectedRoute;