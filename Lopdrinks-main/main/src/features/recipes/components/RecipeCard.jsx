import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
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
      className="flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md sm:w-[300px]"
      aria-label={`Recipe: ${recipe.name}`}
    >
      {/* Image — clicking navigates to detail page */}
      <Link to={`/recipes/${recipe.id}`} aria-label={`View details for ${recipe.name}`} tabIndex={-1}>
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="h-40 w-full object-cover hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-40 w-full items-center justify-center bg-gray-100 text-sm text-gray-400"
            aria-label="No image available"
          >
            No image available
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title + price */}
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/recipes/${recipe.id}`}
            className="text-lg font-semibold leading-snug text-gray-900 hover:text-green-700 transition-colors"
          >
            {recipe.name}
          </Link>
          <span className="whitespace-nowrap text-base font-semibold text-gray-900">
            {formatCurrency(recipe.price)}
          </span>
        </div>

        {recipe.description && (
          <p className="line-clamp-2 text-sm text-gray-500">{recipe.description}</p>
        )}

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {recipe.brew_method?.name || 'N/A'}
        </p>

        {recipe.category && (
          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            {recipe.category.name}
          </span>
        )}

        {recipe.ingredients?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredients.map((ing) => (
              <span
                key={ing.id}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
              >
                {ing.name} · {ing.quantity}
              </span>
            ))}
          </div>
        )}

        {/* Order status feedback */}
        {orderStatus && (
          <p
            role="status"
            aria-live="polite"
            className={`text-sm font-medium ${
              orderStatus.startsWith('Failed') ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {orderStatus}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            onClick={handleOrderClick}
            className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
            aria-label={showQty ? `Confirm order of ${quantity}` : `Order ${recipe.name}`}
          >
            {showQty ? 'Confirm Order' : 'Order Now'}
          </button>

          {showQty && (
            <div
              className="flex items-center overflow-hidden rounded-lg border border-gray-200"
              role="group"
              aria-label="Quantity selector"
            >
              <button
                onClick={decrease}
                className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="min-w-[2rem] px-1 text-center text-sm font-medium text-gray-800"
                aria-live="polite"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                onClick={increase}
                className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-2 border-t border-gray-100 pt-3">
            <button
              onClick={() => onEdit(recipe)}
              className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
              aria-label={`Edit recipe: ${recipe.name}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
              aria-label={`Delete recipe: ${recipe.name}`}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
});

RecipeCard.displayName = 'RecipeCard';
export default RecipeCard;