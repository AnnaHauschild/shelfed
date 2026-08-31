import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEpisodeTracking } from '@/hooks/useEpisodeTracking';
import { useSeasonEpisodes } from '@/hooks/useSeasonEpisodes';
import { useTvSeasons } from '@/hooks/useTvSeasons';
import { fonts, radius, spacing } from '@/theme';
import { colors } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

/**
 * Season/episode browser for a series' details view. Seasons collapse by
 * default; expanding one lazily loads its episodes from TMDB.
 */
export function TvSeasons({ tvId }: { tvId: string }) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { data: seasons, isLoading } = useTvSeasons(tvId, true);
  const { watched } = useEpisodeTracking(tvId);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (isLoading) {
    return (
      <>
        <Text style={styles.label}>Seasons</Text>
        <ActivityIndicator color={chrome.accent} style={styles.loader} />
      </>
    );
  }
  if (!seasons || seasons.length === 0) return null;

  const totalEpisodes = seasons.reduce((n, s) => n + s.episodeCount, 0);
  const watchedTotal = Math.min(watched.size, totalEpisodes);

  return (
    <>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Seasons</Text>
        {watchedTotal > 0 && (
          <Text style={styles.labelCount}>
            {watchedTotal}/{totalEpisodes} watched
          </Text>
        )}
      </View>
      {seasons.map((s) => {
        const open = expanded === s.seasonNumber;
        const seasonWatched = countSeasonWatched(watched, s.seasonNumber);
        const complete = s.episodeCount > 0 && seasonWatched >= s.episodeCount;
        return (
          <View key={s.seasonNumber}>
            <Pressable
              style={styles.seasonRow}
              onPress={() => setExpanded(open ? null : s.seasonNumber)}
            >
              <View style={styles.seasonInfo}>
                <Text style={styles.seasonName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.seasonMeta}>
                  {seasonWatched > 0
                    ? `${seasonWatched}/${s.episodeCount}`
                    : s.episodeCount}{' '}
                  episodes{s.airYear ? ` · ${s.airYear}` : ''}
                </Text>
              </View>
              {complete && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={chrome.accent}
                  style={styles.seasonDone}
                />
              )}
              <Ionicons
                name={open ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={chrome.muted}
              />
            </Pressable>
            {open && <EpisodeList tvId={tvId} seasonNumber={s.seasonNumber} />}
          </View>
        );
      })}
    </>
  );
}

const epKey = (season: number, episode: number) => `${season}-${episode}`;

function countSeasonWatched(watched: Set<string>, season: number): number {
  const prefix = `${season}-`;
  let n = 0;
  for (const k of watched) if (k.startsWith(prefix)) n++;
  return n;
}

function EpisodeList({
  tvId,
  seasonNumber,
}: {
  tvId: string;
  seasonNumber: number;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { data: episodes, isLoading } = useSeasonEpisodes(tvId, seasonNumber);
  const { watched, toggleEpisode, setSeasonWatched } = useEpisodeTracking(tvId);

  if (isLoading) {
    return <ActivityIndicator color={chrome.accent} style={styles.loader} />;
  }
  if (!episodes || episodes.length === 0) return null;

  const nums = episodes.map((e) => e.episodeNumber);
  const allWatched = nums.every((n) => watched.has(epKey(seasonNumber, n)));

  return (
    <View style={styles.episodeList}>
      <Pressable
        style={styles.markAll}
        onPress={() => setSeasonWatched(seasonNumber, nums, !allWatched)}
      >
        <Ionicons
          name={allWatched ? 'checkbox' : 'square-outline'}
          size={16}
          color={allWatched ? chrome.accent : chrome.muted}
        />
        <Text style={styles.markAllText}>
          {allWatched ? 'Unmark season' : 'Mark season watched'}
        </Text>
      </Pressable>
      {episodes.map((e) => {
        const on = watched.has(epKey(seasonNumber, e.episodeNumber));
        return (
          <Pressable
            key={e.episodeNumber}
            style={styles.episodeRow}
            onPress={() => toggleEpisode(seasonNumber, e.episodeNumber)}
          >
            <Ionicons
              name={on ? 'checkbox' : 'square-outline'}
              size={18}
              color={on ? chrome.accent : chrome.muted}
            />
            <Text style={styles.episodeNum}>{e.episodeNumber}</Text>
            <View style={styles.episodeInfo}>
              <Text
                style={[styles.episodeName, on && styles.episodeNameDone]}
                numberOfLines={1}
              >
                {e.name}
              </Text>
              {e.airDate ? (
                <Text style={styles.episodeMeta}>{e.airDate}</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    label: {
      color: c.accent,
      fontFamily: fonts.label,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    loader: {
      marginVertical: spacing.md,
    },
    seasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
      marginBottom: spacing.xs,
    },
    seasonInfo: {
      flex: 1,
    },
    seasonName: {
      color: colors.textOnDark,
      fontFamily: fonts.label,
      fontSize: 14,
    },
    seasonMeta: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 14,
      marginTop: 1,
    },
    episodeList: {
      paddingLeft: spacing.sm,
      marginBottom: spacing.sm,
      gap: spacing.xs,
    },
    episodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 4,
    },
    episodeNum: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 12,
      width: 22,
      textAlign: 'center',
    },
    episodeInfo: {
      flex: 1,
    },
    episodeName: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
    },
    episodeMeta: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 13,
      marginTop: 1,
    },
    episodeNameDone: {
      color: c.muted,
      textDecorationLine: 'line-through',
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    labelCount: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    seasonDone: {
      marginRight: spacing.xs,
    },
    markAll: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 4,
      marginBottom: 2,
    },
    markAllText: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 12,
    },
  });
