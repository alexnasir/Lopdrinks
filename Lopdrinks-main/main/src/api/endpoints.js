/**
 * Single source of truth for all API endpoint strings.
 * Using functions for parameterised routes keeps call sites clean.
 */
export const ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',

  // Recipes
  RECIPES: '/recipes/',
  RECIPE: (id) => `/recipes/${id}`,
  RECIPES_BY_CATEGORY: (categoryId) => `/recipes/category/${categoryId}`,

  // Categories
  CATEGORIES: '/categories/',
  CATEGORY: (id) => `/categories/${id}`,

  // Brew Methods
  BREW_METHODS: '/brew_methods/',
  BREW_METHOD: (id) => `/brew_methods/${id}`,

  // Ingredients
  INGREDIENTS: '/ingredients/',
  INGREDIENT: (id) => `/ingredients/${id}`,

  // Orders
  ORDERS: '/orders/',
  ORDER: (id) => `/orders/${id}`,

  // Upload
  UPLOAD: '/upload',
};
