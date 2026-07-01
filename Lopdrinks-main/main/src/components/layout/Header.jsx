import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES, ROLES } from '../../constants';
import {
  FaBars,
  FaSun,
  FaMoon,
  FaHome,
  FaInfo,
  FaUtensils,
  FaEnvelope,
  FaSignInAlt,
  FaSignOutAlt,
  FaTachometerAlt,
} from 'react-icons/fa';

/**
 * Top navigation bar. Fully accessible keyboard-navigable sidebar on mobile.
 *
 * @param {{ isLoggedIn: boolean, role: string, onLogout: () => void }} props
 */
const Header = ({ isLoggedIn, role, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const navItems = [
    ...(isLoggedIn
      ? [
          {
            to: role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD,
            label: 'Dashboard',
            icon: <FaTachometerAlt aria-hidden="true" />,
          },
        ]
      : []),
    { to: ROUTES.HOME, label: 'Home', icon: <FaHome aria-hidden="true" /> },
    { to: ROUTES.ABOUT, label: 'About', icon: <FaInfo aria-hidden="true" /> },
    { to: ROUTES.RECIPES, label: 'Recipes', icon: <FaUtensils aria-hidden="true" /> },
    { to: ROUTES.CONTACT, label: 'Contact', icon: <FaEnvelope aria-hidden="true" /> },
    ...(isLoggedIn
      ? [
          {
            to: null,
            label: 'Logout',
            icon: <FaSignOutAlt aria-hidden="true" />,
            action: () => { onLogout(); closeMenu(); },
          },
        ]
      : [{ to: ROUTES.LOGIN, label: 'Login', icon: <FaSignInAlt aria-hidden="true" /> }]),
  ];

  return (
    <header
      className={`p-4 fixed top-0 w-full z-20 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'
      }`}
    >
      <nav
        className="container mx-auto flex justify-between items-center"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <NavLink
          to={ROUTES.HOME}
          className="text-2xl font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          aria-label="LopCafe home"
        >
          LopCafe
        </NavLink>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 rounded p-1"
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="main-nav"
          >
            <FaBars aria-hidden="true" />
          </button>
          <button
            onClick={toggleTheme}
            className="text-xl hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded p-1"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </button>
        </div>

        {/* Nav links */}
        <ul
          id="main-nav"
          className={`lg:flex lg:space-x-6 lg:items-center lg:static ${
            isMenuOpen
              ? 'fixed top-16 left-0 w-16 h-full flex flex-col items-center pt-8 gap-6 bg-gray-900'
              : 'hidden'
          } lg:flex lg:flex-row lg:w-auto lg:h-auto lg:pt-0 lg:gap-0 transition-all duration-300`}
        >
          {navItems.map((item) => (
            <li
              key={item.label}
              className="relative group p-4 lg:p-0"
              title={item.label}
            >
              {item.to ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center lg:block hover:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded ${
                      isActive ? 'text-blue-400 lg:underline' : ''
                    }`
                  }
                  onClick={closeMenu}
                >
                  <span className="text-2xl lg:hidden" aria-hidden="true">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  {/* Tooltip for icon-only mobile sidebar */}
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-blue-400 text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity lg:hidden pointer-events-none whitespace-nowrap">
                    {item.label}
                  </span>
                </NavLink>
              ) : (
                <button
                  onClick={item.action}
                  className="flex items-center lg:block hover:text-gray-400 transition-colors bg-red-600 lg:bg-transparent p-2 lg:p-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={item.label}
                >
                  <span className="text-2xl lg:hidden" aria-hidden="true">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-blue-400 text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity lg:hidden pointer-events-none whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
