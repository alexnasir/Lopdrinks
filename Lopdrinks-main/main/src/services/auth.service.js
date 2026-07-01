import apiClient from '../api/interceptors';
import { ENDPOINTS } from '../api/endpoints';


const authService = {
  login: async (credentials) => {
    const { data } = await apiClient.post(ENDPOINTS.LOGIN, credentials);
    return data?.data ?? data;
  },

  register: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.REGISTER, payload);
    return data?.data ?? data;
  },

  
  verify: async (payload) => {
    const { data } = await apiClient.post(ENDPOINTS.VERIFY, payload);
    return data?.data ?? data;
  },
};

export default authService;
