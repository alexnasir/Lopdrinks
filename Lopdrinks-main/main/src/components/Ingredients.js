import React, { useState, useEffect } from 'react';
import Api from './api';
import { useTheme } from './ThemeContext';

const Ingredients = () => {
  const backend = Api();
  const { isDarkMode } = useTheme();
  const [ingredients, setIngredients] = useState([]);
  const [formData, setFormData] = useState({ name: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadIngredients = async () => {
      setIsLoading(true);
      try {
        const data = await backend.fetchIngredients();
        if (isMounted) setIngredients(data || []);
      } catch (err) {
        console.error('Failed to load ingredients:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadIngredients();
    return () => {
      isMounted = false;
    };
  }, [backend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await backend.createIngredient(formData);
      const data = await backend.fetchIngredients();
      setIngredients(data || []);
      setFormData({ name: '' });
    } catch (err) {
      console.error('Create ingredient error:', err.message);
    }
  };

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-4">Ingredients</h1>
      {isLoading}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Ingredient
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ingredients.map((ing) => (
          <div key={ing.id} className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold">{ing.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ingredients;