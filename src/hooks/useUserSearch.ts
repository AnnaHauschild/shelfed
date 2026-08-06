import { useEffect, useState } from 'react';
import { UserSummary, searchUsers } from '@/api/follows';
import { useAuth } from '@/context/AuthProvider';

/** Debounced username search (excludes the current user). */
export function useUserSearch(query: string) {
  const { userId } = useAuth();
  const [results, setResults] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!userId || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let alive = true;
    const t = setTimeout(() => {
      searchUsers(q, userId)
        .then((r) => alive && setResults(r))
        .catch(() => alive && setResults([]))
        .finally(() => alive && setLoading(false));
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, userId]);

  return { results, loading };
}
