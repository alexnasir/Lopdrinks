import React, { useState } from 'react';

const RecipeCard = ({ recipe, onOrder, isAdmin, onEdit, onDelete }) => {
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderStatus, setOrderStatus] = useState(null);

  const handleOrderClick = async () => {
    if (!showQuantitySelector) {
      setShowQuantitySelector(true);
    } else {
      try {
        await onOrder(recipe.id, quantity);
        setOrderStatus(`Successfully ordered ${quantity} of ${recipe.name}!`);
        setShowQuantitySelector(false);
        setQuantity(1);
        setTimeout(() => setOrderStatus(null), 3000);
      } catch (error) {
        const errorMessage = error.data?.message || error.message || 'Unknown error';
        setOrderStatus(`Failed to place order.Please Login first: ${errorMessage}`);
        console.error('Order failed:', error);
        setTimeout(() => setOrderStatus(null), 5000);
      }
    }
  };
 
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="bg-yellow shadow-md rounded-lg p-4 m-2 w-full sm:w-[300px]">
      <h3 className="text-lg font-semibold">{recipe.name}</h3>
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.name || 'Recipe image'}
          className="w-full h-40 object-cover rounded-md mb-4"
          loading="lazy"
          onError={(e) => {
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500 text-sm">
          No image available
        </div>
      )}
      <p className="text-white-600 text-sm">{recipe.description}</p>
      <p className="mt-2">Price: ${recipe.price}</p>
      <p className="text-sm">Brew Method: {recipe.brew_method?.name || 'N/A'}</p>
      <div className="mt-2">
        <p className="text-sm font-medium">Ingredients:</p>
        <ul className="list-disc list-inside text-sm">
          {recipe.ingredients.map((ing) => (
            <li key={ing.id}>
              {ing.name} ({ing.quantity})
            </li>
          ))}
        </ul>
      </div>
      {orderStatus && (
        <p
          className={`mt-2 text-sm ${
            orderStatus.includes('Failed') ? 'text-red-500' : 'text-green-500'
          }`}
        >
          {orderStatus}
        </p>
      )}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOrderClick}
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
          >
            {showQuantitySelector ? 'Confirm Order' : 'Order Now'}
          </button>
          {showQuantitySelector && (
            <div className="flex items-center">
              <button
                onClick={decreaseQuantity}
                className="bg-gray-300 text-black p-1 rounded-l-md hover:bg-gray-400"
              >
                -
              </button>
              <span className="px-3 py-1 text-blue-700 bg-gray-100">{quantity}</span>
              <button
                onClick={increaseQuantity}
                className="bg-gray-300 text-black p-1 rounded-r-md hover:bg-gray-400"
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
              className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
              Edit Recipe
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Delete Recipe
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;