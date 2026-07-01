import React, { useState, useCallback, memo } from 'react';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Displays a single recipe.
 * Memoised — only re-renders when its own props change.
 *
 * @param {{ recipe: object, onOrder: Function, isAdmin: boolean, onEdit: Function, onDelete: Function }} props
 */
const RecipeCard = memo(({ recipe, onOrder, isAdmin, onEdit, onDelete }) => {
  const [showQty, setShowQty] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderStatus, setOrderStatus] = useState(null);

  const handleOrderClick = useCallback(async () => {
    if (!showQty) {
      setShowQty(true);
      return;
    }
    try {
      await onOrder(recipe.id, quantity);
      setOrderStatus(`Ordered ${quantity}× ${recipe.name}`);
      setShowQty(false);
      setQuantity(1);
      setTimeout(() => setOrderStatus(null), 3000);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Unknown error';
      setOrderStatus(`Failed: ${msg}`);
      setTimeout(() => setOrderStatus(null), 5000);
    }
  }, [showQty, onOrder, recipe.id, recipe.name, quantity]);

  const increase = useCallback(() => setQuantity((q) => q + 1), []);
  const decrease = useCallback(() => setQuantity((q) => Math.max(1, q - 1)), []);

  return (
    <article
      className="bg-white shadow-md rounded-lg p-4 m-2 w-full sm:w-[300px] flex flex-col"
      aria-label={`Recipe: ${recipe.name}`}
    >
      <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>

      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-full h-40 object-cover rounded-md mb-4"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500 text-sm"
          aria-label="No image available"
        >
          No image available
        </div>
      )}

      <p className="text-gray-600 text-sm mb-1">{recipe.description}</p>
      <p className="mt-1 font-medium">Price: {formatCurrency(recipe.price)}</p>
      <p className="text-sm">Brew Method: {recipe.brew_method?.name || 'N/A'}</p>

      {recipe.ingredients?.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium">Ingredients:</p>
          <ul className="list-disc list-inside text-sm" aria-label="Ingredients list">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id}>
                {ing.name} ({ing.quantity})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Order status feedback */}
      {orderStatus && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-2 text-sm ${
            orderStatus.startsWith('Failed') ? 'text-red-500' : 'text-green-600'
          }`}
        >
          {orderStatus}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOrderClick}
            className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label={showQty ? `Confirm order of ${quantity}` : `Order ${recipe.name}`}
          >
            {showQty ? 'Confirm Order' : 'Order Now'}
          </button>
          {showQty && (
            <div className="flex items-center" role="group" aria-label="Quantity selector">
              <button
                onClick={decrease}
                className="bg-gray-300 text-black px-2 py-1 rounded-l-md hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="px-3 py-1 text-blue-700 bg-gray-100"
                aria-live="polite"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                onClick={increase}
                className="bg-gray-300 text-black px-2 py-1 rounded-r-md hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>

        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(recipe)}
              className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label={`Edit recipe: ${recipe.name}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label={`Delete recipe: ${recipe.name}`}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
});

RecipeCard.displayName = 'RecipeCard';
export default RecipeCard;
