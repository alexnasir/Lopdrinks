import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { recipeService, orderService } from '../services';
import { Loader } from '../components/feedback';
import { formatCurrency } from '../utils/formatters';
import { ROUTES } from '../constants';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaCoffee,
  FaLeaf,
  FaTag,
  FaShoppingCart,
} from 'react-icons/fa';

/**
 * Recipe detail page — shown after clicking a recipe card.
 * Route: /recipes/:id
 */
const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { isDarkMode } = useTheme();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    recipeService
      .getById(id)
      .then((data) => {
        if (!active) return;
        // Unwrap envelope if needed
        setRecipe(data?.data ?? data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load recipe.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const handleOrder = useCallback(async () => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setOrdering(true);
    try {
      await orderService.place(recipe.id, quantity);
      setOrderDone(true);
      toast.success(`Ordered ${quantity}× ${recipe.name}!`);
      setTimeout(() => setOrderDone(false), 4000);
    } catch (err) {
      toast.error(err.message || 'Order failed.');
    } finally {
      setOrdering(false);
    }
  }, [isLoggedIn, navigate, recipe, quantity]);

  const bg = isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const mutedText = isDarkMode ? 'text-gray-300' : 'text-gray-500';

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <main className={`min-h-screen p-6 ${bg}`}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm text-blue-500 hover:underline"
        >
          <FaArrowLeft aria-hidden="true" /> Back
        </button>
        <p role="alert" className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!recipe) return null;

  return (
    <main className={`min-h-screen p-6 ${bg}`}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        aria-label="Go back"
      >
        <FaArrowLeft aria-hidden="true" /> Back to recipes
      </button>

      <article
        className={`max-w-3xl mx-auto rounded-2xl shadow-lg overflow-hidden ${cardBg}`}
        aria-label={`Recipe detail: ${recipe.name}`}
      >
        {/* Hero image */}
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
            No image available
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{recipe.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {recipe.category && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    <FaTag aria-hidden="true" className="text-green-500" />
                    {recipe.category.name}
                  </span>
                )}
                {recipe.takeaway && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Takeaway available
                  </span>
                )}
              </div>
            </div>
            <span className="text-3xl font-bold text-green-600">
              {formatCurrency(recipe.price)}
            </span>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className={`leading-relaxed ${mutedText}`}>{recipe.description}</p>
          )}

          {/* Brew method */}
          {recipe.brew_method && (
            <section aria-labelledby="brew-heading">
              <h2
                id="brew-heading"
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-2"
              >
                <FaCoffee aria-hidden="true" /> Brew Method
              </h2>
              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                <p className="font-semibold">{recipe.brew_method.name}</p>
                {recipe.brew_method.details && (
                  <p className={`mt-1 text-sm ${mutedText}`}>{recipe.brew_method.details}</p>
                )}
              </div>
            </section>
          )}

          {/* Ingredients */}
          {recipe.ingredients?.length > 0 && (
            <section aria-labelledby="ing-heading">
              <h2
                id="ing-heading"
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-3"
              >
                <FaLeaf aria-hidden="true" /> Ingredients
              </h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="list">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={ing.id}
                    className={`flex flex-col rounded-lg p-3 text-sm ${
                      isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{ing.name}</span>
                    <span className={`text-xs mt-0.5 ${mutedText}`}>{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Order section */}
          <section
            className={`rounded-xl p-5 ${isDarkMode ? 'bg-gray-600' : 'bg-green-50'}`}
            aria-labelledby="order-heading"
          >
            <h2 id="order-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaShoppingCart aria-hidden="true" /> Place an Order
            </h2>

            <div className="flex flex-wrap items-center gap-4">
              {/* Quantity */}
              <div
                className="flex items-center overflow-hidden rounded-lg border border-gray-300"
                role="group"
                aria-label="Quantity selector"
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span
                  className="min-w-[2.5rem] px-2 text-center font-semibold"
                  aria-live="polite"
                  aria-label={`Quantity: ${quantity}`}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Total */}
              <span className={`text-sm font-medium ${mutedText}`}>
                Total: <strong className="text-gray-900 dark:text-white">{formatCurrency(recipe.price * quantity)}</strong>
              </span>

              {/* Order button */}
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="flex-1 min-w-[140px] rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
                aria-label={`Order ${quantity} of ${recipe.name}`}
              >
                {ordering ? 'Placing order…' : !isLoggedIn ? 'Login to Order' : 'Order Now'}
              </button>
            </div>

            {orderDone && (
              <p role="status" aria-live="polite" className="mt-3 text-sm font-medium text-green-600">
                ✓ Order placed successfully!
              </p>
            )}
          </section>
        </div>
      </article>
    </main>
  );
};

export default RecipeDetailPage;
