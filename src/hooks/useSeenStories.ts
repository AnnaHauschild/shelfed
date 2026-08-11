import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSetting, setSetting } from '@/db/settings';

const KEY = 'seenStoryIds';
const MAX = 500; // keep the stored set bounded (24h stories churn anyway)

async function loadSeen(): Promise<Set<string>> {
  const raw = await getSetting(KEY);
  try {
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** The set of story-post ids the user has already viewed (persisted locally). */
export function useSeenStories() {
  return useQuery({
    queryKey: ['story-seen'],
    queryFn: loadSeen,
    staleTime: Infinity,
  });
}

/** Marks a story post as viewed; updates the cache now and persists in the bg. */
export function useMarkStorySeen() {
  const qc = useQueryClient();
  return useCallback(
    (id: string) => {
      const cur = qc.getQueryData<Set<string>>(['story-seen']) ?? new Set<string>();
      if (cur.has(id)) return;
      const next = new Set(cur);
      next.add(id);
      qc.setQueryData(['story-seen'], next);
      setSetting(KEY, JSON.stringify([...next].slice(-MAX))).catch(() => {});
    },
    [qc],
  );
}
