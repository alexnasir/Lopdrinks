import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { recipeService, categoryService } from '../services';
import { Loader } from '../components/feedback';
import { ROUTES } from '../constants';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

/**
 * Admin page — assign / reassign categories to recipes in bulk.
 * Route: /admin/recipe-category  (adminOnly)
 */
const AdminRecipeCategoryPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Map of recipeId → selected categoryId (local, uncommitted)
  const [assignments, setAssignments] = useState({});
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');

  const bg = isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const inputCls = 'rounded-md border border-gray-300 p-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

  useEffect(() => {
    let active = true;
    Promise.all([recipeService.getAll(), categoryService.getAll()])
      .then(([rawRecipes, cats]) => {
        if (!active) return;
        const recipeList = Array.isArray(rawRecipes)
          ? rawRecipes
          : rawRecipes?.data ?? [];
        setRecipes(recipeList);
        setCategories(cats);
        // Seed assignments from current recipe state
        const initial = {};
        recipeList.forEach((r) => {
          initial[r.id] = r.category?.id ?? '';
        });
        setAssignments(initial);
      })
      .catch((err) => toast.error(err.message || 'Failed to load data.'))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const handleChange = (recipeId, categoryId) => {
    setAssignments((prev) => ({ ...prev, [recipeId]: categoryId }));
  };

  const handleSave = useCallback(async (recipe) => {
    const categoryId = assignments[recipe.id];
    if (!categoryId) {
      toast.error('Please select a category first.');
      return;
    }
    setSaving((prev) => ({ ...prev, [recipe.id]: true }));
    try {
      await recipeService.update(recipe.id, { category_id: Number(categoryId) });
      toast.success(`"${recipe.name}" → category updated.`);
    } catch (err) {
      toast.error(err.message || 'Failed to update.');
    } finally {
      setSaving((prev) => ({ ...prev, [recipe.id]: false }));
    }
  }, [assignments]);

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className={`min-h-screen p-6 ${bg}`}>
      <button
        onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
        className="flex items-center gap-2 mb-6 text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        aria-label="Back to dashboard"
      >
        <FaArrowLeft aria-hidden="true" /> Admin Dashboard
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Recipe → Category Assignment</h1>
        <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Set or change the category each recipe belongs to.
        </p>

        {/* Search */}
        <input
          type="search"
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputCls} w-full mb-5`}
          aria-label="Search recipes"
        />

        {isLoading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No recipes found.</p>
        ) : (
          <ul className="space-y-3" role="list" aria-label="Recipe category assignments">
            {filtered.map((recipe) => (
              <li
                key={recipe.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${cardBg}`}
              >
                {/* Recipe info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {recipe.image_url && (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{recipe.name}</p>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      Current: {recipe.category?.name ?? <em>none</em>}
                    </p>
                  </div>
                </div>

                {/* Category selector */}
                <select
                  value={assignments[recipe.id] ?? ''}
                  onChange={(e) => handleChange(recipe.id, e.target.value)}
                  className={`${inputCls} min-w-[160px]`}
                  aria-label={`Category for ${recipe.name}`}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {/* Save button */}
                <button
                  onClick={() => handleSave(recipe)}
                  disabled={saving[recipe.id]}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Save category for ${recipe.name}`}
                >
                  <FaSave aria-hidden="true" />
                  {saving[recipe.id] ? 'Saving…' : 'Save'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default AdminRecipeCategoryPage;
