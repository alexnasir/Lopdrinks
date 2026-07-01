import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../hooks';
import { orderService } from '../services';
import { RecipeCard, RecipeForm } from '../features/recipes';
import { Loader } from '../components/feedback';
import toast from 'react-hot-toast';

/**
 * Public recipes listing page with inline admin CRUD capabilities.
 * Composes useRecipes hook — no direct service calls in JSX.
 */
const RecipesPage = () => {
  const { isAdmin } = useAuth();
  const { recipes, isLoading, createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const handleOrder = useCallback(async (recipeId, quantity) => {
    return orderService.place(recipeId, quantity);
  }, []);

  const handleEdit = useCallback((recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(id);
    } catch (err) {
      toast.error(err.message);
    }
  }, [deleteRecipe]);

  const handleFormSubmit = useCallback(async (data) => {
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, data);
      } else {
        await createRecipe(data);
      }
      setShowForm(false);
      setEditingRecipe(null);
    } catch (err) {
      toast.error(err.message);
    }
  }, [editingRecipe, updateRecipe, createRecipe]);

  if (isLoading) return <Loader />;

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Recipes</h1>
        {isAdmin && (
          <button
            onClick={() => { setEditingRecipe(null); setShowForm(true); }}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Add new recipe"
          >
            + Add Recipe
          </button>
        )}
      </div>

      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditingRecipe(null); }}
        />
      )}

      {recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          aria-label="Recipes list"
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOrder={handleOrder}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default RecipesPage;
