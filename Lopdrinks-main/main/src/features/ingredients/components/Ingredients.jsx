import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ingredientService } from '../../../services';
import toast from 'react-hot-toast';

/**
 * Admin-only ingredients management panel.
 */
const Ingredients = () => {
  const { isDarkMode } = useTheme();
  const [ingredients, setIngredients] = useState([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    ingredientService
      .getAll()
      .then((data) => { if (active) setIngredients(data); })
      .catch((err) => toast.error(err.message))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await ingredientService.create({ name: name.trim() });
      const data = await ingredientService.getAll();
      setIngredients(data);
      setName('');
      toast.success('Ingredient added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <main
      className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
      aria-label="Ingredients management"
    >
      <h1 className="text-2xl font-bold mb-4">Ingredients</h1>
      {isLoading && <p aria-live="polite">Loading…</p>}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6" aria-label="Add ingredient">
        <div className="mb-4">
          <label htmlFor="ingredient-name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="ingredient-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingredient name"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add Ingredient
        </button>
      </form>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Ingredients list">
        {ingredients.map((ing) => (
          <li key={ing.id} className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold">{ing.name}</h3>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Ingredients;
