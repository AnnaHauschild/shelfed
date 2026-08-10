import { supabase } from './supabase';
import { getFollowingIds, getProfiles, UserSummary } from './follows';
import { MediaType } from './types';

/** A draggable text sticker placed on the story poster. */
export interface TextOverlay {
  id: string;
  kind: 'text';
  text: string;
  font: string; // STORY_FONTS key
  color: string; // hex
  tx: number; // x offset from canvas centre, normalized to canvas width
  ty: number; // y offset from canvas centre, normalized to canvas height
  scale: number;
  rotation?: number; // radians
}

/** A draggable emoji sticker placed on the story poster. */
export interface EmojiOverlay {
  id: string;
  kind: 'emoji';
  emoji: string;
  tx: number;
  ty: number;
  scale: number;
  rotation?: number; // radians
}

/** The resizable/movable film card itself (one per post, kind 'card'). */
export interface CardLayout {
  id: 'card';
  kind: 'card';
  tx: number; // centre offset, normalized to stage width
  ty: number; // centre offset, normalized to stage height
  scale: number;
}

export type Sticker = TextOverlay | EmojiOverlay;
export type Overlay = Sticker | CardLayout;

export interface StoryPost {
  id: string;
  userId: string;
  mediaType: MediaType;
  movieId: string;
  title: string | null;
  posterPath: string | null;
  year: number | null;
  caption: string | null;
  overlays: Overlay[];
  createdAt: string;
}

/** A friend (or you) plus their recent posts, for the Stories row. */
export interface StoryGroup {
  user: UserSummary;
  posts: StoryPost[];
}

interface PostableMovie {
  id: string;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: number | null;
}

/** Publishes a title to the user's story (visible to accepted followers). */
export async function createPost(
  userId: string,
  movie: PostableMovie,
  caption: string,
  overlays: Overlay[] = [],
): Promise<{ error?: string }> {
  const { error } = await supabase.from('posts').insert({
    user_id: userId,
    media_type: movie.mediaType,
    movie_id: movie.id,
    title: movie.title,
    poster_path: movie.posterPath,
    year: movie.year,
    caption: caption.trim() || null,
    overlays,
  });
  return error ? { error: error.message } : {};
}

function rowToPost(r: {
  id: string;
  user_id: string;
  media_type: string;
  movie_id: string;
  title: string | null;
  poster_path: string | null;
  year: number | null;
  caption: string | null;
  overlays: Overlay[] | null;
  created_at: string;
}): StoryPost {
  return {
    id: r.id,
    userId: r.user_id,
    mediaType: r.media_type as MediaType,
    movieId: r.movie_id,
    title: r.title,
    posterPath: r.poster_path,
    year: r.year,
    caption: r.caption,
    overlays: Array.isArray(r.overlays) ? r.overlays : [],
    createdAt: r.created_at,
  };
}

/**
 * The last 24h of stories from the user and their accepted followees, grouped
 * per person (newest group first, newest post first within a group).
 */
export async function getStories(userId: string): Promise<StoryGroup[]> {
  const followeeIds = await getFollowingIds(userId);
  const ids = Array.from(new Set([userId, ...followeeIds]));
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .in('user_id', ids)
    .gt('created_at', since)
    .order('created_at', { ascending: false });
  const posts = (data ?? []).map(rowToPost);
  if (posts.length === 0) return [];

  const profiles = await getProfiles(Array.from(new Set(posts.map((p) => p.userId))));
  const byId = new Map(profiles.map((u) => [u.id, u]));

  const groups: StoryGroup[] = [];
  const index = new Map<string, StoryGroup>();
  for (const p of posts) {
    const user = byId.get(p.userId);
    if (!user) continue;
    let g = index.get(p.userId);
    if (!g) {
      g = { user, posts: [] };
      index.set(p.userId, g);
      groups.push(g);
    }
    g.posts.push(p);
  }
  // Put "you" first if present, otherwise keep newest-post order.
  groups.sort((a, b) => {
    if (a.user.id === userId) return -1;
    if (b.user.id === userId) return 1;
    return 0;
  });
  return groups;
}

/** Deletes one of the user's own posts. */
export async function deletePost(id: string): Promise<void> {
  await supabase.from('posts').delete().eq('id', id);
}
