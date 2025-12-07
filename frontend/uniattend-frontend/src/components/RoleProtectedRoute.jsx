// src/components/RoleProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../pages/LoadingScreen';

/**
 * Protects routes based on authentication status and user role.
 * @param {string[]} allowedRoles - Array of roles allowed to access the route.
 */
const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (user && allowedRoles.includes(user.role)) {
    // User is authenticated and has the correct role
    return <Outlet />;
  }

  // User is authenticated but has the wrong role
  return <Navigate to="/" replace />; // Redirect to their designated dashboard
};

export default RoleProtectedRoute;