import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

// Server returns { success, message, data: [...] }
const toArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    for (const key of ['data', 'items', 'results']) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

const ingredientService = {
  /** @returns {Promise<Array>} */
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.INGREDIENTS);
    return toArray(data);
  },

  /** @param {{ name: string }} payload */
  create: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.INGREDIENTS, payload);
    return data;
  },
};

export default ingredientService;
