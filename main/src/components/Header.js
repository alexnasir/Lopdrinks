import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { FaBars, FaSun, FaMoon, FaHome, FaInfo, FaUtensils, FaEnvelope, FaSignInAlt, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const Header = ({ isLoggedIn, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const role = localStorage.getItem('role'); 

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    console.log('Menu toggled:', !isMenuOpen);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
    console.log('Nav item clicked, menu closed');
  };

  const navItems = [
    ...(isLoggedIn
      ? [
          {
            to: role === 'Admin' ? '/admin-dashboard' : '/user-dashboard',
            label: 'Dashboard',
            icon: <FaTachometerAlt />,
          },
        ]
      : []),
    { to: '/', label: 'Home', icon: <FaHome /> },
    { to: '/about', label: 'About', icon: <FaInfo /> },
    { to: '/recipes', label: 'Recipes', icon: <FaUtensils /> },
    { to: '/contact', label: 'Contact', icon: <FaEnvelope /> },
    ...(isLoggedIn
      ? [
          {
            to: null,
            label: 'Logout',
            icon: <FaSignOutAlt />,
            action: () => {
              onLogout();
              handleNavClick();
            },
          },
        ]
      : [
          { to: '/login', label: 'Login', icon: <FaSignInAlt /> },
        ]),
  ];

  return (
    <header
      className={`p-4 fixed top-0 w-full z-20 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'
      }`}
    >
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-extrabold">LopCafe</div>
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-2xl"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <FaBars />
          </button>
          <button
            onClick={toggleTheme}
            className="text-xl hover:text-gray-400"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <ul
          className={`lg:flex lg:space-x-6 lg:items-center lg:static ${
            isMenuOpen
              ? 'fixed top-16 left-0 w-16 h-full flex flex-col items-center pt-8 gap-6 bg-gray-900 lg:bg-transparent'
              : 'hidden'
          } lg:flex lg:flex-row lg:w-auto lg:h-auto lg:pt-0 lg:gap-0 transition-all duration-300 ease-in-out`}
        >
          {navItems.map((item) => (
            <li
              key={item.label}
              className="relative group p-4 lg:p-0 pointer-events-auto"
              title={item.label}
            >
              {item.to ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center lg:block hover:text-gray-400 transition-colors ${
                      isActive ? 'text-blue-400 lg:underline' : ''
                    }`
                  }
                  onClick={handleNavClick}
                >
                  <span className="text-2xl lg:hidden">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  <span
                    className={`absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-blue-500 text-sm font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 lg:hidden pointer-events-none`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              ) : (
                <button
                  onClick={item.action}
                  className="flex items-center lg:block hover:text-gray-400 transition-colors bg-red-600 lg:bg-transparent p-2 lg:p-0 rounded"
                >
                  <span className="text-2xl lg:hidden">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  <span
                    className={`absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-blue-500 text-sm font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 lg:hidden pointer-events-none`}
                  >
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