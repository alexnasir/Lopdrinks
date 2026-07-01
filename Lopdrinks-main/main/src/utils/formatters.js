/**
 * Currency formatter — "12.5" → "$12.50"
 * @param {number|string} amount
 */
export const formatCurrency = (amount) =>
  `Ksh.${Number(amount).toFixed(2)}`;

/**
 * Locale-aware date/time formatter.
 * @param {string|Date} dateStr
 */
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString();

/**
 * Capitalises the first letter of a string.
 * @param {string} str
 */
export const capitalise = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1);
