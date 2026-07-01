import React, { createContext, useState, useContext, useCallback } from 'react';

const ThemeContext = createContext(null);

/**
 * Provides isDarkMode + toggleTheme to the component tree.
 * Preserves the exact same API as the original ThemeContext.js.
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** @returns {{ isDarkMode: boolean, toggleTheme: () => void }} */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

export default ThemeProvider;
