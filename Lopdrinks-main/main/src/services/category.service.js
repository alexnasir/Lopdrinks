import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

const toArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    for (const key of ['items', 'categories', 'data', 'results']) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return [];
};

const categoryService = {
  /** @returns {Promise<Array>} */
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.CATEGORIES);
    return toArray(data);
  },

  /** @param {number} id */
  getById: async (id) => {
    const { data } = await apiClient.get(ENDPOINTS.CATEGORY(id));
    return data?.data ?? data;
  },

  /** @param {object} payload — { name } */
  create: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.CATEGORIES, payload);
    return data;
  },

  /** @param {number} id @param {object} payload */
  update: async (id, payload) => {
    const { data } = await apiClient.put(ENDPOINTS.CATEGORY(id), payload);
    return data;
  },

  /** @param {number} id */
  remove: async (id) => {
    const { data } = await apiClient.delete(ENDPOINTS.CATEGORY(id));
    return data;
  },
};

export default categoryService;
