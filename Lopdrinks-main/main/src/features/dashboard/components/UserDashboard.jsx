import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { orderService } from '../../../services';
import { OrderList } from '../../orders';
import { ROUTES } from '../../../constants/routes';

/**
 * User dashboard — shows pending orders and quick-nav buttons.
 */
const UserDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { isLoggedIn } = useAuth();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setError('Please log in to view orders.');
      return;
    }
    let active = true;
    orderService
      .getPending(5)
      .then((data) => { if (active) setPendingOrders(data); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [isLoggedIn]);

  const handleUpdate = async (id, data) => {
    await orderService.update(id, data);
    const updated = await orderService.getPending(5);
    setPendingOrders(updated);
  };

  const handleDelete = async (id) => {
    await orderService.remove(id);
    setPendingOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <main className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      <nav aria-label="Dashboard quick links" className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        <button
          onClick={() => navigate(ROUTES.RECIPES)}
          className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Browse Recipes
        </button>
        <button
          onClick={() => navigate(ROUTES.ORDERS)}
          className="bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          View My Orders
        </button>
      </nav>

      <section aria-label="Pending orders" className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Your Pending Orders</h2>
        {error ? (
          <p role="alert" className="text-red-500">{error}</p>
        ) : (
          <OrderList
            orders={pendingOrders}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isAdmin={false}
          />
        )}
      </section>
    </main>
  );
};

export default UserDashboard;
