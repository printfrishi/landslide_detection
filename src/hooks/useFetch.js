import { useEffect, useState } from 'react';

/**
 * Small data-fetching hook for the mock service layer. Handles loading/error
 * state, ignores stale responses after unmount or dependency changes, and
 * exposes refetch() for retry buttons.
 */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, isLoading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    fetcher()
      .then((data) => {
        if (active) setState({ data, isLoading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, isLoading: false, error });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const refetch = () => setAttempt((value) => value + 1);
  return { ...state, refetch };
}
