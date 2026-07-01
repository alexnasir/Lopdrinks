import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

const orderService = {
  /** @returns {Promise<Array>} */
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS);
    return data ?? [];
  },

  /**
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  getRecent: async (limit = 5) => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS, {
      params: { limit },
    });
    return data ?? [];
  },

  /**
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  getPending: async (limit = 5) => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS, {
      params: { limit, status: 'Pending' },
    });
    return data ?? [];
  },

  /** @param {number} id */
  getById: async (id) => {
    const { data } = await apiClient.get(ENDPOINTS.ORDER(id));
    return data;
  },

  /**
   * @param {number} recipeId
   * @param {number} quantity
   */
  place: async (recipeId, quantity = 1) => {
    const { data } = await apiClient.post(ENDPOINTS.ORDERS, {
      recipe_id: Number(recipeId),
      quantity: Number(quantity),
    });
    return data;
  },

  /** @param {number} id @param {{ quantity?: number, status?: string }} payload */
  update: async (id, payload) => {
    const { data } = await apiClient.patch(ENDPOINTS.ORDER(id), payload);
    return data;
  },

  /** @param {number} id */
  remove: async (id) => {
    const { data } = await apiClient.delete(ENDPOINTS.ORDER(id));
    return data;
  },
};

export default orderService;
