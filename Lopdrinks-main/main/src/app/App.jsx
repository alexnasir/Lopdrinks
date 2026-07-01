import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout';
import { ErrorBoundary } from '../components/feedback';
import AppRoutes, { useLogout } from './routes';

/**
 * Root application shell.
 *
 * Responsibilities:
 * - Applies global dark/light background
 * - Renders the fixed Header with auth props
 * - Wraps routing in an ErrorBoundary
 *
 * All provider composition happens in providers.jsx.
 * All routing logic lives in routes.jsx.
 */
const AppShell = () => {
  const { isDarkMode } = useTheme();
  const { isLoggedIn, role } = useAuth();
  const logout = useLogout();

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
    >
      <ErrorBoundary>
        <Header isLoggedIn={isLoggedIn} role={role} onLogout={logout} />
      </ErrorBoundary>

      {/* Push content below fixed header */}
      <div className="pt-16">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AppShell;
