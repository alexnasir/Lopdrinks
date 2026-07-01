import React, { useState, useEffect } from 'react';
import Api from './api';
import RecipeCard from './RecipeCard';
import RecipeForm from './RecipeForm';
import Loader from './Loader';

const Recipes = () => {
  const api = Api();
  const [recipes, setRecipes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'Admin');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadRecipes = async () => {
      try {
        const data = await api.fetchRecipes();
        if (isMounted) {
          setRecipes(data);
        }
      } catch (err) {
        console.error('Load recipes error:', err);
      }
    };
    loadRecipes();
    return () => {
      isMounted = false;
    };
  }, [api]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'Admin');
  }, []);

  const handleOrder = async (recipeId, quantity) => {
    try {
      await api.placeOrder(recipeId, quantity);
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await api.deleteRecipe(recipeId);
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
      } catch (err) {
        console.error('Delete recipe error:', err);
      }
    }
  };

  const handleFormSubmit = async (recipeData) => {
    try {
      if (editingRecipe) {
        await api.updateRecipe(editingRecipe.id, recipeData);
        setRecipes(
          recipes.map((recipe) =>
            recipe.id === editingRecipe.id ? { ...recipe, ...recipeData } : recipe
          )
        );
      } else {
        await api.createRecipe(recipeData);
        const updatedRecipes = await api.fetchRecipes();
        setRecipes(updatedRecipes);
      }
      setShowForm(false);
      setEditingRecipe(null);
    } catch (err) {
      console.error('Save recipe error:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 ">Recipes</h1>
    
      
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecipe(null);
          }}
        />
      )}
      {recipes.length === 0 ? (
<Loader />
) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
    </div>
  );
};

export default Recipes;
