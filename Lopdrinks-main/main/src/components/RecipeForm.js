import React, { useState, useEffect } from 'react';
import Api from './api';

const RecipeForm = ({ recipe, onSubmit, onCancel }) => {
  const api = Api();
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    price: recipe?.price || '',
    takeaway: recipe?.takeaway || false,
    brew_method_id: recipe?.brew_method?.id || '',
    ingredients: recipe?.ingredients?.map((ing) => ({
      ingredient_id: ing.id,
      quantity: ing.quantity,
    })) || [],
    image_url: recipe?.image_url || '',
  });
  const [brewMethods, setBrewMethods] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [methods, ingredients] = await Promise.all([
          api.fetchBrewMethods(),
          api.fetchIngredients(),
        ]);
        setBrewMethods(methods);
        setAvailableIngredients(ingredients);
      } catch (err) {
        setError(err.data?.message || 'Failed to load data');
      }
    };
    fetchData();
  }, [api]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleIngredientChange = (ingredientId, quantity) => {
    setFormData((prev) => {
      const existing = prev.ingredients.find((ing) => ing.ingredient_id === ingredientId);
      if (existing) {
        if (quantity === '') {
          return {
            ...prev,
            ingredients: prev.ingredients.filter((ing) => ing.ingredient_id !== ingredientId),
          };
        }
        return {
          ...prev,
          ingredients: prev.ingredients.map((ing) =>
            ing.ingredient_id === ingredientId ? { ...ing, quantity } : ing
          ),
        };
      }
      if (quantity !== '') {
        return {
          ...prev,
          ingredients: [...prev.ingredients, { ingredient_id: ingredientId, quantity }],
        };
      }
      return prev;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
      setImageFile(file);
      setError(null);
    } else {
      setError('Please select a valid image (PNG, JPEG, GIF)');
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        const uploadResponse = await api.uploadImage(imageFile);
        imageUrl = uploadResponse.image_url;
      }

      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        takeaway: formData.takeaway,
        brew_method_id: parseInt(formData.brew_method_id),
        ingredients: formData.ingredients,
        image_url: imageUrl,
      };

      if (!data.name || !data.price || !data.brew_method_id) {
        throw new Error('Name, price, and brew method are required');
      }

      await onSubmit(data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to save recipe');
      console.error('Form submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-green-600 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{recipe ? 'Edit Recipe' : 'Add Recipe'}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="takeaway"
                checked={formData.takeaway}
                onChange={handleInputChange}
                className="mr-2 text-gray-600"
              />
              Available for Takeaway
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Brew Method</label>
            <select
              name="brew_method_id"
              value={formData.brew_method_id}
              onChange={handleInputChange}
              className="w-full p-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a brew method</option>
              {brewMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image</label>
            {formData.image_url && (
              <img
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${formData.image_url}`}
                alt="Preview"
                className="w-32 h-32 object-cover mb-2 rounded-md"
              />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif"
              onChange={handleImageChange}
              className="w-full p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Ingredients</label>
            {availableIngredients.map((ing) => (
              <div key={ing.id} className="flex items-center mb-2">
                <span className="w-32">{ing.name}</span>
                <input
                  type="text"
                  placeholder="Quantity"
                  value={
                    formData.ingredients.find((i) => i.ingredient_id === ing.id)?.quantity || ''
                  }
                  onChange={(e) => handleIngredientChange(ing.id, e.target.value)}
                  className="w-24 p-1 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;