import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

const ingredientService = {
  /** @returns {Promise<Array>} */
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.INGREDIENTS);
    return data ?? [];
  },

  /** @param {{ name: string }} payload */
  create: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.INGREDIENTS, payload);
    return data;
  },
};

export default ingredientService;
