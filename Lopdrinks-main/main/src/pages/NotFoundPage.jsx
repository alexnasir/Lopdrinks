import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

/**
 * 404 fallback page.
 */
const NotFoundPage = () => (
  <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
    <h1 className="text-6xl font-extrabold text-blue-600 mb-4">404</h1>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
    <p className="text-gray-600 mb-8">
      LopCafe does not support this route.
    </p>
    <Link
      to={ROUTES.HOME}
      className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Return Home
    </Link>
  </main>
);

export default NotFoundPage;
