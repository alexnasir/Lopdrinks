import React, { useState } from 'react';

const OrderList = ({ orders, isSummary = false, onUpdate, onDelete, isAdmin = false }) => {
  const [editingOrder, setEditingOrder] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('');

  const handleEdit = (order) => {
    setEditingOrder(order.id);
    setQuantity(order.quantity.toString());
    setStatus(order.status);
  };

  const handleUpdate = async (orderId) => {
    try {
      const updateData = {};
      if (quantity && !isNaN(quantity) && Number(quantity) > 0) {
        updateData.quantity = Number(quantity);
      }
      if (status && isAdmin) {
        updateData.status = status;
      }
      if (Object.keys(updateData).length === 0) {
        alert('No changes to update');
        return;
      }
      await onUpdate(orderId, updateData);
      setEditingOrder(null);
      setQuantity('');
      setStatus('');
    } catch (error) {
      alert('Failed to update order: ' + error.message);
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await onDelete(orderId);
      } catch (error) {
        alert('Failed to delete order: ' + error.message);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">{isSummary ? 'Recent Orders' : 'Your Orders'}</h2>
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
              <p className="font-medium">
                {order.recipe_name || `Recipe #${order.recipe_id}`}
              </p>
              {editingOrder === order.id ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium">Quantity:</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      min="1"
                    />
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium">Status:</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(order.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingOrder(null)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>Quantity: {order.quantity}</p>
                  <p>Total: ${(order.unit_price * order.quantity).toFixed(2)}</p>
                  {!isSummary && <p>Status: {order.status}</p>}
                  <p className="text-sm text-gray-600">
                    Ordered: {new Date(order.ordered_at).toLocaleString()}
                  </p>
                  {!isSummary && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      {(isAdmin || order.status === 'Pending') && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;