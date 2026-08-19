import { MediaType } from '@/api/types';
import { supabase } from './supabase';

/** Shelf types that are mirrored to the cloud ('skipped' stays local-only). */
export type ShelfType = 'watched' | 'watchlist' | 'favorite';

export function isShelfType(type: string): type is ShelfType {
  return type === 'watched' || type === 'watchlist' || type === 'favorite';
}

/** Minimal movie shape needed to render a shared shelf item. */
export interface ShelfItem {
  mediaType: MediaType;
  movieId: string;
  type: ShelfType;
  title: string;
  posterPath: string | null;
  year: number | null;
}

interface SyncableMovie {
  id: string;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  year: number | null;
}

function toRow(userId: string, item: ShelfItem) {
  return {
    user_id: userId,
    media_type: item.mediaType,
    movie_id: item.movieId,
    type: item.type,
    title: item.title,
    poster_path: item.posterPath,
    year: item.year,
    updated_at: new Date().toISOString(),
  };
}

/** Mirrors a single add of a shareable shelf item to the cloud. */
export async function pushItem(
  userId: string,
  movie: SyncableMovie,
  type: ShelfType,
): Promise<void> {
  await supabase.from('shelf_items').upsert(
    toRow(userId, {
      mediaType: movie.mediaType,
      movieId: movie.id,
      type,
      title: movie.title,
      posterPath: movie.posterPath,
      year: movie.year,
    }),
  );
}

/** Mirrors a single removal of a shareable shelf item. */
export async function removeItem(
  userId: string,
  mediaType: MediaType,
  movieId: string,
  type: ShelfType,
): Promise<void> {
  await supabase
    .from('shelf_items')
    .delete()
    .eq('user_id', userId)
    .eq('media_type', mediaType)
    .eq('movie_id', movieId)
    .eq('type', type);
}

/** Bulk-uploads local shelf items (used on sign-in). */
export async function pushMany(
  userId: string,
  items: ShelfItem[],
): Promise<void> {
  if (items.length === 0) return;
  await supabase.from('shelf_items').upsert(items.map((i) => toRow(userId, i)));
}

/** Deletes ALL of a user's cloud shelf items (used by a shelf reset). */
export async function deleteAllShelfItems(userId: string): Promise<void> {
  await supabase.from('shelf_items').delete().eq('user_id', userId);
}

/** Deletes a user's cloud shelf items of the given types (per-shelf clear). */
export async function deleteShelfItemsByType(
  userId: string,
  types: ShelfType[],
): Promise<void> {
  if (types.length === 0) return;
  await supabase
    .from('shelf_items')
    .delete()
    .eq('user_id', userId)
    .in('type', types);
}

/** Downloads the user's entire cloud shelf. */
export async function pullShelf(userId: string): Promise<ShelfItem[]> {
  const { data } = await supabase
    .from('shelf_items')
    .select('media_type, movie_id, type, title, poster_path, year')
    .eq('user_id', userId);
  return (data ?? []).map((r) => ({
    mediaType: r.media_type as MediaType,
    movieId: String(r.movie_id),
    type: r.type as ShelfType,
    title: r.title ?? '',
    posterPath: r.poster_path,
    year: r.year,
  }));
}
