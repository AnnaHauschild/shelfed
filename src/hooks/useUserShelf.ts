import { useQuery } from '@tanstack/react-query';
import { pullShelf } from '@/api/shelfSync';

/** A followed user's cloud shelf (RLS allows reads only for their followers). */
export function useUserShelf(userId: string | null) {
  return useQuery({
    queryKey: ['user-shelf', userId],
    queryFn: () => pullShelf(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}
