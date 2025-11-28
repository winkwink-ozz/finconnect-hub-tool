import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if the "admin_authenticated" flag is set in browser memory
  const isAuthenticated = sessionStorage.getItem('finconnect_admin_auth') === 'true';

  // If not logged in, kick them to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, let them see the Admin pages (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
