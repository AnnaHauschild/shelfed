import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptFollowRequest,
  followUser,
  getFollowing,
  getFollowRequests,
  rejectFollowRequest,
  unfollowUser,
} from '@/api/follows';
import { useAuth } from '@/context/AuthProvider';

/** The current user's following list, incoming requests and follow actions. */
export function useFollows() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const followingKey = ['following', userId];
  const requestsKey = ['follow-requests', userId];

  const { data: following } = useQuery({
    queryKey: followingKey,
    queryFn: () => getFollowing(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
  const { data: requests } = useQuery({
    queryKey: requestsKey,
    queryFn: () => getFollowRequests(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });

  const entries = following ?? [];
  const accepted = new Set(
    entries.filter((u) => u.status === 'accepted').map((u) => u.id),
  );
  const pending = new Set(
    entries.filter((u) => u.status === 'pending').map((u) => u.id),
  );
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: followingKey });
    qc.invalidateQueries({ queryKey: requestsKey });
    qc.invalidateQueries({ queryKey: ['user-shelf'] });
  };

  const follow = useMutation({
    mutationFn: (followeeId: string) => followUser(userId as string, followeeId),
    onSuccess: invalidate,
  });
  const unfollow = useMutation({
    mutationFn: (followeeId: string) =>
      unfollowUser(userId as string, followeeId),
    onSuccess: invalidate,
  });
  const accept = useMutation({
    mutationFn: (followerId: string) =>
      acceptFollowRequest(followerId, userId as string),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (followerId: string) =>
      rejectFollowRequest(followerId, userId as string),
    onSuccess: invalidate,
  });

  return {
    following: entries.filter((u) => u.status === 'accepted'),
    requests: requests ?? [],
    isFollowing: (id: string) => accepted.has(id),
    isRequested: (id: string) => pending.has(id),
    follow: (id: string) => follow.mutate(id),
    unfollow: (id: string) => unfollow.mutate(id),
    accept: (id: string) => accept.mutate(id),
    reject: (id: string) => reject.mutate(id),
  };
}
