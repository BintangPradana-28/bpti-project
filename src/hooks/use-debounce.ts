"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value by a given delay in milliseconds.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to wait before updating debounced value (default: 350ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
