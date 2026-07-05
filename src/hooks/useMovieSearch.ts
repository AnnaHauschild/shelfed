import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/api/movies';
import { useLanguage } from '@/context/LanguageProvider';
import { useMediaType } from '@/context/MediaTypeProvider';

/**
 * Free-text movie search for the Search tab. Disabled until the query has at
 * least two characters to avoid noisy requests; results are kept briefly so
 * re-typing the same query is instant.
 */
export function useMovieSearch(query: string) {
  const mediaType = useMediaType();
  const { language } = useLanguage();
  const q = query.trim();
  return useQuery({
    queryKey: ['search', mediaType, language, q],
    queryFn: () => searchMovies(q, mediaType),
    enabled: q.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
