import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followUser, getFollowing, unfollowUser } from '@/api/follows';
import { useAuth } from '@/context/AuthProvider';

/** The current user's following list plus follow/unfollow actions. */
export function useFollows() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const queryKey = ['following', userId];

  const { data: following } = useQuery({
    queryKey,
    queryFn: () => getFollowing(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  const list = following ?? [];
  const ids = new Set(list.map((u) => u.id));
  const invalidate = () => qc.invalidateQueries({ queryKey });

  const follow = useMutation({
    mutationFn: (followeeId: string) => followUser(userId as string, followeeId),
    onSuccess: invalidate,
  });
  const unfollow = useMutation({
    mutationFn: (followeeId: string) =>
      unfollowUser(userId as string, followeeId),
    onSuccess: invalidate,
  });

  return {
    following: list,
    isFollowing: (id: string) => ids.has(id),
    follow: (id: string) => follow.mutate(id),
    unfollow: (id: string) => unfollow.mutate(id),
  };
}
