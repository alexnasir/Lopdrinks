import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeForm } from '../features/recipes';
import { recipeService } from '../services';
import { ROUTES } from '../constants/routes';
import toast from 'react-hot-toast';

/**
 * Standalone page for creating / editing a recipe (admin only).
 * RecipeForm owns its own loading state — no duplication here.
 *
 * @param {{ editingRecipe?: object, onClearEdit?: () => void }} props
 */
const CreateRecipePage = ({ editingRecipe, onClearEdit }) => {
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (data) => {
    try {
      if (editingRecipe) {
        await recipeService.update(editingRecipe.id, data);
        toast.success('Recipe updated');
        onClearEdit?.();
      } else {
        await recipeService.create(data);
        toast.success('Recipe created');
      }
      navigate(ROUTES.RECIPES);
    } catch (err) {
      toast.error(err.message);
    }
  }, [editingRecipe, navigate, onClearEdit]);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
      </h1>
      <RecipeForm
        recipe={editingRecipe}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.RECIPES)}
      />
    </main>
  );
};

export default CreateRecipePage;
