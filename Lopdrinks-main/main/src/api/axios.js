import axios from 'axios';

/**
 * Central axios instance.
 *
 * Development  — REACT_APP_API_URL is intentionally empty.
 *   Requests go to a relative path (e.g. "/recipes/") which the CRA dev
 *   server proxies to https://lopdrinks-api.onrender.com, bypassing CORS.
 *
 * Production   — REACT_APP_API_URL is set to the full API origin.
 *   Requests go directly to the backend; CORS is handled server-side.
 */
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;
