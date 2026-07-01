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

const brewService = {
  /** @returns {Promise<Array>} */
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.BREW_METHODS);
    return toArray(data);
  },

  create: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.BREW_METHODS, payload);
    return data;
  },
};

export default brewService;
