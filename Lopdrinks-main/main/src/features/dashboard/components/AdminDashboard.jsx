import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { ROUTES } from '../../../constants/routes';

/**
 * Admin dashboard — navigation cards to all management sections.
 */
const AdminDashboard = memo(() => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const bg = isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900';
  const cardBg = isDarkMode ? 'bg-gray-700' : 'bg-white';

  const cards = [
    { label: 'Manage Recipes', btn: 'Go to Recipes', route: ROUTES.RECIPES, color: 'blue' },
    { label: 'Create Recipe', btn: 'Create New Recipe', route: ROUTES.CREATE_RECIPE, color: 'green' },
    { label: 'Manage Categories', btn: 'Go to Categories', route: ROUTES.ADMIN_CATEGORIES, color: 'teal' },
    { label: 'Recipe → Category', btn: 'Assign Categories', route: ROUTES.ADMIN_RECIPE_CATEGORY, color: 'indigo' },
    { label: 'Manage Brew Methods', btn: 'Go to Brew Methods', route: ROUTES.BREW_METHODS, color: 'purple' },
    { label: 'Manage Ingredients', btn: 'Go to Ingredients', route: ROUTES.INGREDIENTS, color: 'orange' },
    { label: 'View All Orders', btn: 'View Orders', route: ROUTES.ORDERS, color: 'red' },
  ];

  const colorMap = {
    blue:   'bg-blue-500 hover:bg-blue-600',
    green:  'bg-green-500 hover:bg-green-600',
    teal:   'bg-teal-500 hover:bg-teal-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    red:    'bg-red-500 hover:bg-red-600',
  };

  return (
    <main className={`min-h-screen p-6 ${bg} flex flex-col lg:flex-row gap-6`}>
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ label, btn, route, color }) => (
            <div
              key={label}
              className={`p-4 rounded-xl shadow-lg ${cardBg} hover:opacity-90 transition-opacity`}
            >
              <h2 className="text-lg font-semibold mb-2">{label}</h2>
              <button
                onClick={() => navigate(route)}
                className={`w-full ${colorMap[color]} text-white p-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${color}-400`}
                aria-label={btn}
              >
                {btn}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick-actions sidebar */}
      <aside className={`w-full lg:w-80 p-4 rounded-xl shadow-lg ${cardBg}`}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <nav aria-label="Quick actions">
          <ul className="space-y-3">
            {[
              { label: 'Recent Recipes', route: ROUTES.RECIPES },
              { label: 'Check Ingredients', route: ROUTES.INGREDIENTS },
              { label: 'Pending Orders', route: ROUTES.ORDERS },
            ].map(({ label, route }) => (
              <li key={label}>
                <button
                  onClick={() => navigate(route)}
                  className="w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </main>
  );
});

AdminDashboard.displayName = 'AdminDashboard';
export default AdminDashboard;
