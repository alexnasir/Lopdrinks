import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';

/**
 * All authentication-related API calls live here.
 * No axios/fetch calls should exist in UI components.
 */
const authService = {
  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, role: string }>}
   */
  login: async (credentials) => {
    const { data } = await apiClient.post(ENDPOINTS.LOGIN, credentials);
    // Server envelope: { success, message, data: { token, role } }
    return data?.data ?? data;
  },

  /**
   * @param {{ username: string, email: string, password: string, role?: string }} payload
   * @returns {Promise<{ otp: string }>}
   */
  register: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.REGISTER, payload);
    // Server envelope: { success, message, data: { otp } }
    return data?.data ?? data;
  },

  /**
   * @param {{ email: string, otp: string }} payload
   * @returns {Promise<any>}
   */
  verify: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.VERIFY, payload);
    return data?.data ?? data;
  },
};

export default authService;
