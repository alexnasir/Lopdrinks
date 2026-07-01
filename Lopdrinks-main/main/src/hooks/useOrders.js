import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services';
import toast from 'react-hot-toast';

/**
 * Manages full order list state and CRUD.
 * @param {boolean} autoFetch  Whether to fetch on mount.
 */
const useOrders = (autoFetch = true) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    let active = true;
    setIsLoading(true);
    orderService
      .getAll()
      .then((data) => { if (active) setOrders(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [autoFetch]);

  const placeOrder = useCallback(async (recipeId, quantity) => {
    const result = await orderService.place(recipeId, quantity);
    await fetchOrders();
    toast.success('Order placed!');
    return result;
  }, [fetchOrders]);

  const updateOrder = useCallback(async (id, payload) => {
    await orderService.update(id, payload);
    await fetchOrders();
    toast.success('Order updated');
  }, [fetchOrders]);

  const deleteOrder = useCallback(async (id) => {
    await orderService.remove(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success('Order deleted');
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    placeOrder,
    updateOrder,
    deleteOrder,
  };
};

export default useOrders;
