import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ROLES } from '../../constants';

/**
 * Route guard component.
 *
 * @param {{ adminOnly?: boolean, children: React.ReactNode }} props
 *
 * Reads role from both AuthContext and localStorage so it never
 * races against the async state update that follows persistAuth().
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, role } = useAuth();

  // persistAuth writes to localStorage synchronously before setting React state.
  // Reading from localStorage here ensures ProtectedRoute never sees a stale role
  // on the first render after login.
  const effectiveRole = role || localStorage.getItem('role') || ROLES.USER;
  const loggedIn = isLoggedIn || Boolean(localStorage.getItem('token'));

  if (!loggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (adminOnly && effectiveRole !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;
