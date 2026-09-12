import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce value changes (e.g. search inputs, filter sliders)
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {any} debouncedValue
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
