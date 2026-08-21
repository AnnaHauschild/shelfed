import { useQuery } from '@tanstack/react-query';
import { fetchOriginalYear } from '@/api/originalYear';

/**
 * Original (first) publication year from Open Library, for books only. Lazy and
 * cached forever — it never changes and only the details view needs it.
 */
export function useOriginalYear(
  title: string,
  author: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['original-year', title, author ?? null],
    queryFn: () => fetchOriginalYear(title, author),
    enabled: enabled && title.trim().length > 0,
    staleTime: Infinity,
  });
}
