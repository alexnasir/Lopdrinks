import React, { createContext, useState, useContext, useCallback } from 'react';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

/**
 * AuthContext centralises all auth state previously scattered across App.js.
 *
 * Consumers get: token, role, isLoggedIn, isAdmin,
 *                persistAuth(), clearAuth()
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(
    () => localStorage.getItem('role') || ROLES.USER
  );

  /**
   * Call after a successful login/register-verify flow.
   * @param {string} newToken
   * @param {string} newRole
   */
  const persistAuth = useCallback((newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
  }, []);

  /** Call on logout — wipes stored credentials. */
  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(ROLES.USER);
  }, []);

  const value = {
    token,
    role,
    isLoggedIn: Boolean(token),
    isAdmin: role === ROLES.ADMIN,
    persistAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** @returns {ReturnType<typeof AuthContext.Provider>['value']} */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthProvider;
