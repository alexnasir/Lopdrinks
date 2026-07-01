import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms.
 * @template T
 * @param {T} value
 * @param {number} delay  Milliseconds to wait (default 300)
 * @returns {T}
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
