import { GIPHY_API_KEY, GIPHY_BASE_URL } from '@/constants/config';

/** A single GIF result trimmed to what a sticker needs. */
export interface GifResult {
  id: string;
  url: string; // animated GIF to place on the poster
  previewUrl: string; // smaller animated preview for the picker grid
  aspect: number; // width / height
}

/** Whether a Giphy key is configured (feature stays hidden otherwise). */
export function hasGiphyKey(): boolean {
  return GIPHY_API_KEY.length > 0;
}

interface GiphyImage {
  url: string;
  width: string;
  height: string;
}

interface GiphyItem {
  id: string;
  images: {
    downsized: GiphyImage;
    fixed_width: GiphyImage;
    fixed_width_small?: GiphyImage;
  };
}

async function fetchGifs(
  path: 'search' | 'trending',
  params: Record<string, string>,
): Promise<GifResult[]> {
  if (!GIPHY_API_KEY) return [];
  const qs = new URLSearchParams({ api_key: GIPHY_API_KEY, ...params }).toString();
  const res = await fetch(`${GIPHY_BASE_URL}/${path}?${qs}`);
  if (!res.ok) throw new Error(`Giphy request failed (${res.status})`);
  const json = (await res.json()) as { data: GiphyItem[] };
  return (json.data ?? []).map((g) => {
    const img = g.images.fixed_width ?? g.images.downsized;
    const w = Number(img.width) || 200;
    const h = Number(img.height) || 200;
    return {
      id: g.id,
      url: img.url,
      previewUrl: g.images.fixed_width_small?.url ?? img.url,
      aspect: w / h,
    };
  });
}

/** Search GIFs; empty query returns the trending set. */
export function searchGifs(query: string): Promise<GifResult[]> {
  const q = query.trim();
  if (!q) return trendingGifs();
  return fetchGifs('search', { q, limit: '24', rating: 'pg-13' });
}

/** Trending GIFs, shown before the user types anything. */
export function trendingGifs(): Promise<GifResult[]> {
  return fetchGifs('trending', { limit: '24', rating: 'pg-13' });
}
