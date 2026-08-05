import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { episodeRepository } from '@/repositories';

/**
 * Per-episode watched tracking for a series, backed by SQLite. Returns the set
 * of watched "season-episode" keys plus toggle/bulk mutations that refresh it.
 */
export function useEpisodeTracking(tvId: string) {
  const qc = useQueryClient();
  const queryKey = ['episode-watches', tvId];

  const { data: watched } = useQuery({
    queryKey,
    queryFn: () => episodeRepository.getWatched(tvId),
    staleTime: Infinity,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey });

  const toggle = useMutation({
    mutationFn: ({ season, episode }: { season: number; episode: number }) =>
      episodeRepository.toggle(tvId, season, episode),
    onSuccess: invalidate,
  });

  const season = useMutation({
    mutationFn: (args: {
      season: number;
      episodes: number[];
      watched: boolean;
    }) =>
      episodeRepository.setSeason(
        tvId,
        args.season,
        args.episodes,
        args.watched,
      ),
    onSuccess: invalidate,
  });

  return {
    watched: watched ?? new Set<string>(),
    toggleEpisode: (s: number, e: number) => toggle.mutate({ season: s, episode: e }),
    setSeasonWatched: (s: number, episodes: number[], w: boolean) =>
      season.mutate({ season: s, episodes, watched: w }),
  };
}
