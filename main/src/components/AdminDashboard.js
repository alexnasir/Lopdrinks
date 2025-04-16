import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'
      } flex flex-col lg:flex-row gap-6`}
    >
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Grid of Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Recipes */}
          <div
            className={`p-4 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } hover:bg-blue-50 transition-colors`}
          >
            <h2 className="text-lg font-semibold mb-2">Manage Recipes</h2>
            <button
              onClick={() => navigate('/recipes')}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Recipes
            </button>
          </div>

          {/* Create Recipe */}
          <div
            className={`p-4 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } hover:bg-green-50 transition-colors`}
          >
            <h2 className="text-lg font-semibold mb-2">Create Recipe</h2>
            <button
              onClick={() => navigate('/create-recipe')}
              className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition-colors"
            >
              Create New Recipe
            </button>
          </div>

          {/* Manage Brew Methods */}
          <div
            className={`p-4 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } hover:bg-purple-50 transition-colors`}
          >
            <h2 className="text-lg font-semibold mb-2">Manage Brew Methods</h2>
            <button
              onClick={() => navigate('/brew-methods')}
              className="w-full bg-purple-500 text-white p-3 rounded-md hover:bg-purple-600 transition-colors"
            >
              Go to Brew Methods
            </button>
          </div>

          {/* Manage Ingredients */}
          <div
            className={`p-4 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } hover:bg-orange-50 transition-colors`}
          >
            <h2 className="text-lg font-semibold mb-2">Manage Ingredients</h2>
            <button
              onClick={() => navigate('/ingredients')}
              className="w-full bg-orange-500 text-white p-3 rounded-md hover:bg-orange-600 transition-colors"
            >
              Go to Ingredients
            </button>
          </div>

          {/* View All Orders */}
          <div
            className={`p-4 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } hover:bg-red-50 transition-colors`}
          >
            <h2 className="text-lg font-semibold mb-2">View All Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar (Inspired by the right panel in the image) */}
      <div
        className={`w-full lg:w-80 p-4 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-white'
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/recipes')}
            className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="ml-2">Recent Recipes</span>
          </button>
          <button
            onClick={() => navigate('/ingredients')}
            className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="ml-2">Check Ingredients</span>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="ml-2">Pending Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;