import { useState, useCallback } from 'react';

/**
 * Generic hook for wrapping async service calls with loading / error state.
 *
 * @template T
 * @param {(...args: any[]) => Promise<T>} asyncFn  The service function to call.
 * @returns {{ data: T|null, isLoading: boolean, error: string|null, execute: (...args: any[]) => Promise<T> }}
 */
const useApi = (asyncFn) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        setData(result);
        return result;
      } catch (err) {
        const msg = err.message || 'An error occurred';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn]
  );

  return { data, isLoading, error, execute };
};

export default useApi;
