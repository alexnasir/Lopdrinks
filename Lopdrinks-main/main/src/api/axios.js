import axios from 'axios';

/**
 * Central axios instance.
 * Base URL is read from the environment at build time.
 * All requests automatically attach the JWT stored in localStorage.
 */
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://lopdrinks-api.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,  // JWT is sent via Authorization header, not cookies
});

export default apiClient;
