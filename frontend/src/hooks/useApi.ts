import { useState, useCallback } from "react";
import { ApiError } from "../lib/api";

interface UseApiResult<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | undefined>;
  data: T | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useApi<T, Args extends unknown[]>(
  apiFunc: (...args: Args) => Promise<T>
): UseApiResult<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, data, loading, error, reset };
}
