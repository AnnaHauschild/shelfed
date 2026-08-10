import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, deletePost, getStories } from '@/api/posts';
import { hasSupabase } from '@/api/supabase';
import { MediaType } from '@/api/types';
import { useAuth } from '@/context/AuthProvider';

/** The last 24h of stories from the user + their accepted friends. */
export function useStories() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['stories', userId],
    queryFn: () => getStories(userId as string),
    enabled: hasSupabase && !!userId,
    staleTime: 1000 * 60,
  });
}

interface PostableMovie {
  id: string;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: number | null;
}

/** Publishes a title (with an optional caption) to the user's story. */
export function useCreatePost() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movie, caption }: { movie: PostableMovie; caption: string }) =>
      createPost(userId as string, movie, caption),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  });
}

/** Deletes one of the user's own stories (removes it for everyone). */
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  });
}
