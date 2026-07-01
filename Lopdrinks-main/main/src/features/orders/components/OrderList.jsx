import React, { useState, useCallback } from 'react';
import { ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus';
import { formatCurrency, formatDate } from '../../../utils/formatters';

/**
 * Displays a list of orders with inline edit/delete capabilities.
 * Purely presentational — all mutations delegated to parent callbacks.
 *
 * @param {{
 *   orders: Array,
 *   isSummary?: boolean,
 *   isAdmin?: boolean,
 *   onUpdate: (id: number, data: object) => Promise<void>,
 *   onDelete: (id: number) => Promise<void>
 * }} props
 */
const OrderList = ({ orders = [], isSummary = false, isAdmin = false, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty]     = useState('');
  const [editStatus, setEditStatus] = useState('');

  const openEdit = useCallback((order) => {
    setEditingId(order.id);
    setEditQty(String(order.quantity));
    setEditStatus(order.status);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditQty('');
    setEditStatus('');
  }, []);

  const handleUpdate = useCallback(async (orderId) => {
    const payload = {};
    const qty = Number(editQty);
    if (editQty && !isNaN(qty) && qty > 0) payload.quantity = qty;
    if (editStatus && isAdmin) payload.status = editStatus;
    if (Object.keys(payload).length === 0) { cancelEdit(); return; }
    try {
      await onUpdate(orderId, payload);
      cancelEdit();
    } catch (_) {
      // toast displayed by parent hook
    }
  }, [editQty, editStatus, isAdmin, onUpdate, cancelEdit]);

  const handleDelete = useCallback(async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try { await onDelete(orderId); } catch (_) { /* parent handles */ }
  }, [onDelete]);

  return (
    <section
      aria-label={isSummary ? 'Recent orders' : 'Your orders'}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <h2 className="text-xl font-bold mb-4">
        {isSummary ? 'Recent Orders' : 'Your Orders'}
      </h2>

      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="bg-white shadow-md rounded-lg p-4">
              <p className="font-medium">
                {order.recipe_name || `Recipe #${order.recipe_id}`}
              </p>

              {editingId === order.id ? (
                /* ── Edit mode ──────────────────────────────────────── */
                <div className="space-y-2 mt-2">
                  <div>
                    <label
                      htmlFor={`qty-${order.id}`}
                      className="block text-sm font-medium"
                    >
                      Quantity
                    </label>
                    <input
                      id={`qty-${order.id}`}
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {isAdmin && (
                    <div>
                      <label
                        htmlFor={`status-${order.id}`}
                        className="block text-sm font-medium"
                      >
                        Status
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                   focus:ring-2 focus:ring-blue-400"
                      >
                        {ORDER_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(order.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                                 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ──────────────────────────────────────── */
                <>
                  <p>Quantity: {order.quantity}</p>
                  <p>Total: {formatCurrency(order.unit_price * order.quantity)}</p>
                  {!isSummary && <p>Status: {order.status}</p>}
                  <p className="text-sm text-gray-600">
                    Ordered: {formatDate(order.ordered_at)}
                  </p>

                  {!isSummary && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openEdit(order)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600
                                   focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-label={`Edit order ${order.id}`}
                      >
                        Edit
                      </button>
                      {(isAdmin || order.status === 'Pending') && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600
                                     focus:outline-none focus:ring-2 focus:ring-red-400"
                          aria-label={`Delete order ${order.id}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default OrderList;
