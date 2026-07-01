import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

const brewService = {
  /** @returns {Promise<Array>} */
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.BREW_METHODS);
    return data ?? [];
  },

  create: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.BREW_METHODS, payload);
    return data;
  },
};

export default brewService;
