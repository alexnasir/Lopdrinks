import { useState, useEffect, useCallback } from 'react';
import { recipeService } from '../services';
import toast from 'react-hot-toast';

/**
 * Encapsulates recipe list state, CRUD operations, and loading.
 * Components become thin presentational shells.
 */
const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    recipeService
      .getAll()
      .then((data) => { if (active) setRecipes(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const createRecipe = useCallback(async (payload) => {
    await recipeService.create(payload);
    await fetchRecipes();
    toast.success('Recipe created');
  }, [fetchRecipes]);

  const updateRecipe = useCallback(async (id, payload) => {
    await recipeService.update(id, payload);
    await fetchRecipes();
    toast.success('Recipe updated');
  }, [fetchRecipes]);

  const deleteRecipe = useCallback(async (id) => {
    await recipeService.remove(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    toast.success('Recipe deleted');
  }, []);

  return {
    recipes,
    isLoading,
    error,
    fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
};

export default useRecipes;
