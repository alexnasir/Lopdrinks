import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import Api from './api';
import OrderList from './OrderList';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const backend = Api();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const orders = await backend.fetchPendingOrders(5); // Fetch up to 5 pending orders
        setPendingOrders(orders);
      } catch (err) {
        setError('Failed to load pending orders: ' + (err.data?.message || err.message));
        console.error('Load pending orders error:', err);
      }
    };

    if (backend.token) {
      loadPendingOrders();
    } else {
      setError('Please log in to view orders.');
    }
  }, [backend]);

  const handleUpdateOrder = async (orderId, data) => {
    try {
      await backend.updateOrder(orderId, data);
      const updatedOrders = await backend.fetchPendingOrders(5);
      setPendingOrders(updatedOrders);
    } catch (error) {
      throw error; // Let OrderList handle the error display
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await backend.deleteOrder(orderId);
      const updatedOrders = await backend.fetchPendingOrders(5);
      setPendingOrders(updatedOrders);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        <button
          onClick={() => navigate('/recipes')}
          className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors"
        >
          Browse Recipes
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition-colors"
        >
          View My Orders
        </button>
      </div>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Your Orders</h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <OrderList
            orders={pendingOrders}
            onUpdate={handleUpdateOrder}
            onDelete={handleDeleteOrder}
            isAdmin={false}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;