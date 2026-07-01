/**
 * Type-safe wrappers around localStorage.
 * Centralises storage access so keys are never duplicated.
 */
export const storage = {
  getToken: () => localStorage.getItem('token'),
  setToken: (t) => localStorage.setItem('token', t),
  removeToken: () => localStorage.removeItem('token'),

  getRole: () => localStorage.getItem('role'),
  setRole: (r) => localStorage.setItem('role', r),
  removeRole: () => localStorage.removeItem('role'),

  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};
