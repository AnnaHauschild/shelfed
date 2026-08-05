import { useQuery } from '@tanstack/react-query';
import { fetchTvSeasons } from '@/api/movies';
import { useLanguage } from '@/context/LanguageProvider';

/** Seasons of a series, for the details view. Only runs for series. */
export function useTvSeasons(tvId: string, enabled: boolean) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['tv-seasons', tvId, language],
    queryFn: () => fetchTvSeasons(tvId),
    enabled,
    staleTime: 1000 * 60 * 60,
  });
}
