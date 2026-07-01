import React, { useState, useEffect } from 'react';
import { brewService, ingredientService, categoryService, uploadService } from '../../../services';
import { recipeSchema } from '../../../validation/recipeSchema';
import appConfig from '../../../config/app.config';

/**
 * Modal form for creating and editing recipes.
 * Fetches its own brew methods + ingredients — it is the owner of that data.
 *
 * @param {{ recipe?: object, onSubmit: Function, onCancel: Function }} props
 */
const RecipeForm = ({ recipe, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    price: recipe?.price || '',
    takeaway: recipe?.takeaway || false,
    brew_method_id: recipe?.brew_method?.id || '',
    category_id: recipe?.category?.id || '',
    ingredients:
      recipe?.ingredients?.map((ing) => ({
        ingredient_id: ing.id,
        quantity: ing.quantity,
      })) || [],
    image_url: recipe?.image_url || '',
  });
  const [brewMethods, setBrewMethods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([brewService.getAll(), ingredientService.getAll(), categoryService.getAll()])
      .then(([methods, ings, cats]) => {
        if (active) {
          setBrewMethods(methods);
          setAvailableIngredients(ings);
          setCategories(cats);
        }
      })
      .catch((err) => {
        if (active) setErrors({ form: err.message });
      });
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleIngredientChange = (ingredientId, quantity) => {
    setFormData((prev) => {
      const existing = prev.ingredients.find((i) => i.ingredient_id === ingredientId);
      if (quantity === '') {
        return { ...prev, ingredients: prev.ingredients.filter((i) => i.ingredient_id !== ingredientId) };
      }
      if (existing) {
        return {
          ...prev,
          ingredients: prev.ingredients.map((i) =>
            i.ingredient_id === ingredientId ? { ...i, quantity } : i
          ),
        };
      }
      return { ...prev, ingredients: [...prev.ingredients, { ingredient_id: ingredientId, quantity }] };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: undefined }));
    } else {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image (PNG, JPEG, GIF)' }));
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        imageUrl = uploadRes.image_url;
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        brew_method_id: parseInt(formData.brew_method_id),
        category_id: parseInt(formData.category_id),
        image_url: imageUrl,
      };

      const result = recipeSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach(({ path, message }) => {
          fieldErrors[path[0]] = message;
        });
        setErrors(fieldErrors);
        return;
      }

      await onSubmit(result.data);
    } catch (err) {
      setErrors({ form: err.data?.message || err.message || 'Failed to save recipe' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label={recipe ? 'Edit recipe' : 'Create recipe'}
    >
      <div className="bg-green-600 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{recipe ? 'Edit Recipe' : 'Add Recipe'}</h2>
        {errors.form && <p role="alert" className="text-red-500 mb-4">{errors.form}</p>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="rf-name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="rf-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="mt-1 text-red-200 text-xs">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="rf-description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="rf-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label htmlFor="rf-price" className="block text-sm font-medium mb-1">Price</label>
            <input
              id="rf-price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
              required
              aria-invalid={!!errors.price}
            />
            {errors.price && <p className="mt-1 text-red-200 text-xs">{errors.price}</p>}
          </div>

          {/* Takeaway */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="takeaway"
                checked={formData.takeaway}
                onChange={handleChange}
                className="text-gray-600"
              />
              <span className="text-sm">Available for Takeaway</span>
            </label>
          </div>

          {/* Brew Method */}
          <div className="mb-4">
            <label htmlFor="rf-brew" className="block text-sm font-medium mb-1">Brew Method</label>
            <select
              id="rf-brew"
              name="brew_method_id"
              value={formData.brew_method_id}
              onChange={handleChange}
              className="w-full p-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-invalid={!!errors.brew_method_id}
            >
              <option value="">Select a brew method</option>
              {brewMethods.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {errors.brew_method_id && <p className="mt-1 text-red-200 text-xs">{errors.brew_method_id}</p>}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="rf-category" className="block text-sm font-medium mb-1">Category</label>
            <select
              id="rf-category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-invalid={!!errors.category_id}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-red-200 text-xs">{errors.category_id}</p>}
          </div>

          {/* Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image</label>
            {formData.image_url && (
              <img
                src={
                  formData.image_url.startsWith('http')
                    ? formData.image_url
                    : `${appConfig.apiBaseUrl}${formData.image_url}`
                }
                alt="Recipe preview"
                className="w-32 h-32 object-cover mb-2 rounded-md"
              />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif"
              onChange={handleImageChange}
              className="w-full p-2"
              aria-label="Upload recipe image"
            />
            {errors.image && <p className="mt-1 text-red-200 text-xs">{errors.image}</p>}
          </div>

          {/* Ingredients */}
          <div className="mb-4">
            <fieldset>
              <legend className="block text-sm font-medium mb-1">Ingredients</legend>
              {availableIngredients.map((ing) => (
                <div key={ing.id} className="flex items-center mb-2 gap-2">
                  <label htmlFor={`ing-${ing.id}`} className="w-32 text-sm">
                    {ing.name}
                  </label>
                  <input
                    id={`ing-${ing.id}`}
                    type="text"
                    placeholder="Quantity"
                    value={
                      formData.ingredients.find((i) => i.ingredient_id === ing.id)?.quantity || ''
                    }
                    onChange={(e) => handleIngredientChange(ing.id, e.target.value)}
                    className="w-24 p-1 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Quantity of ${ing.name}`}
                  />
                </div>
              ))}
            </fieldset>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {isLoading ? 'Saving…' : recipe ? 'Update Recipe' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;
