import { useQuery } from '@tanstack/react-query';
import { fetchSeasonEpisodes } from '@/api/movies';
import { useLanguage } from '@/context/LanguageProvider';

/** Episodes of one season; lazily fetched when a season is expanded. */
export function useSeasonEpisodes(tvId: string, seasonNumber: number | null) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['tv-episodes', tvId, seasonNumber, language],
    queryFn: () => fetchSeasonEpisodes(tvId, seasonNumber as number),
    enabled: seasonNumber != null,
    staleTime: 1000 * 60 * 60,
  });
}
