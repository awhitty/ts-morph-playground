import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 20): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    const handler = setTimeout(() => {
      setIsPending(false);
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return [debouncedValue, isPending];
}
