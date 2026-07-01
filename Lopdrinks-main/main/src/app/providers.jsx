import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

/**
 * Composes all root-level providers in one place.
 * Order matters: Router → Auth → Theme → Toaster.
 *
 * Adding a new provider never touches App.jsx — only this file.
 */
const Providers = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '8px', fontFamily: 'inherit' },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default Providers;
