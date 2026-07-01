import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks';
import { OrderList } from '../features/orders';
import { Loader } from '../components/feedback';

/**
 * Protected orders page — lists all orders for the current user.
 * Admins can change status; users can only modify pending orders.
 */
const OrdersPage = () => {
  const { isAdmin } = useAuth();
  const { orders, isLoading, updateOrder, deleteOrder } = useOrders();

  if (isLoading) return <Loader />;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <OrderList
        orders={orders}
        onUpdate={updateOrder}
        onDelete={deleteOrder}
        isAdmin={isAdmin}
      />
    </main>
  );
};

export default OrdersPage;
