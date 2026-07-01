import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Normalise any API response shape into a plain array.
 * Handles: bare array, { items }, { recipes }, { data }, { results }
 */
const toArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    // Try common envelope keys
    for (const key of ['items', 'recipes', 'data', 'results']) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

const recipeService = {
  /** @returns {Promise<Array>} */
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.RECIPES);
    return toArray(data);
  },

  /** @param {number} id */
  getById: async (id) => {
    const { data } = await apiClient.get(ENDPOINTS.RECIPE(id));
    return data;
  },

  /** @param {object} payload */
  create: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.RECIPES, payload);
    return data;
  },

  /** @param {number} id @param {object} payload */
  update: async (id, payload) => {
    const { data } = await apiClient.put(ENDPOINTS.RECIPE(id), payload);
    return data;
  },

  /** @param {number} id */
  remove: async (id) => {
    const { data } = await apiClient.delete(ENDPOINTS.RECIPE(id));
    return data;
  },
};

export default recipeService;
