import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ROLES } from '../../constants';

/**
 * Route guard component.
 *
 * @param {{ adminOnly?: boolean, children: React.ReactNode }} props
 *
 * - Unauthenticated users → /login
 * - Non-admin users on adminOnly routes → /user-dashboard
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (adminOnly && role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;
