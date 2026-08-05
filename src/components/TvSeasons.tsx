import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  return (
    <>
      <Text style={styles.label}>Seasons</Text>
      {seasons.map((s) => {
        const open = expanded === s.seasonNumber;
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
                  {s.episodeCount} episodes
                  {s.airYear ? ` · ${s.airYear}` : ''}
                </Text>
              </View>
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

  if (isLoading) {
    return <ActivityIndicator color={chrome.accent} style={styles.loader} />;
  }
  if (!episodes || episodes.length === 0) return null;

  return (
    <View style={styles.episodeList}>
      {episodes.map((e) => (
        <View key={e.episodeNumber} style={styles.episodeRow}>
          <Text style={styles.episodeNum}>{e.episodeNumber}</Text>
          <View style={styles.episodeInfo}>
            <Text style={styles.episodeName} numberOfLines={1}>
              {e.name}
            </Text>
            {e.airDate ? (
              <Text style={styles.episodeMeta}>{e.airDate}</Text>
            ) : null}
          </View>
        </View>
      ))}
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
      fontSize: 12,
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
      fontSize: 13,
    },
    episodeMeta: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 1,
    },
  });
