import apiClient from './axios';

/**
 * Request interceptor — attaches the Bearer token when present.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData payloads let the browser set the content-type boundary automatically.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — normalises errors into a consistent shape:
 * { message, status, data }
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      error.message ||
      'An unexpected error occurred';

    // Build a normalised error so callers never need to dig into axios internals
    const normalised = new Error(message);
    normalised.status = status;
    normalised.data = data;
    return Promise.reject(normalised);
  }
);

export default apiClient;
