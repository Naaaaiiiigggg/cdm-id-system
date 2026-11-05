import { useCallback, useEffect, useState } from 'react';
import { friendly } from '../services/errors';

// Runs an async function when the screen opens and gives you
// { data, loading, error, reload } so the screen can show each state.
export default function useLoad(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fn());
    } catch (e) {
      setError(friendly(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}
