import { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoryGroup, StoryPost } from '@/api/posts';
import { Movie } from '@/api/types';
import { useStories } from '@/hooks/useStories';
import { useInteractions } from '@/hooks/useInteractions';
import { PosterImage } from './PosterImage';
import { POSTER_SIZE } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { Avatar } from './Avatar';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

/** A post's minimal Movie, enough to add it to your own shelves. */
function toMovie(p: StoryPost): Movie {
  return {
    id: p.movieId,
    title: p.title ?? '',
    year: p.year,
    genreIds: [],
    genres: [],
    posterPath: p.posterPath,
    backdropPath: null,
    overview: '',
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    mediaType: p.mediaType,
  };
}

/** Horizontal row of friends' stories (last 24h); tap calls onOpen. */
export function StoriesBar({ onOpen }: { onOpen: (group: StoryGroup) => void }) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { data: groups } = useStories();

  if (!groups || groups.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {groups.map((g) => (
        <Pressable key={g.user.id} style={styles.item} onPress={() => onOpen(g)}>
          <View style={styles.ring}>
            <Avatar uri={g.user.avatarUrl} size={54} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            @{g.user.username}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/**
 * Full-screen story viewer, rendered as an in-tree overlay (NOT a nested Modal,
 * which would stack behind the Friends sheet). The parent gives it a group.
 */
export function StoryViewer({
  group,
  onClose,
}: {
  group: StoryGroup | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeViewerStyles(chrome), [chrome]);
  const { toggleWatchlist, toggleFavorite } = useInteractions();
  if (!group) return null;

  return (
    <View style={styles.overlay}>
      <FlatList
        data={group.posts}
        keyExtractor={(p) => p.id}
        horizontal
        pagingEnabled
        style={styles.list}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <View style={styles.header}>
              <Avatar uri={group.user.avatarUrl} size={30} />
              <Text style={styles.headerName}>@{group.user.username}</Text>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </View>
            <PosterImage
              posterPath={item.posterPath}
              title={item.title ?? ''}
              size={POSTER_SIZE}
              style={styles.poster}
            />
            <Text style={styles.movieTitle} numberOfLines={2}>
              {item.title}
              {item.year != null ? `  ·  ${item.year}` : ''}
            </Text>
            {item.caption ? (
              <Text style={styles.caption}>{item.caption}</Text>
            ) : null}
            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => toggleWatchlist(toMovie(item))}
              >
                <Ionicons name="star-outline" size={20} color={colors.star} />
                <Text style={styles.actionLabel}>Wishlist</Text>
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                onPress={() => toggleFavorite(toMovie(item))}
              >
                <Ionicons name="heart-outline" size={20} color={colors.favorite} />
                <Text style={styles.actionLabel}>Favorite</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.close} onPress={onClose} hitSlop={10}>
        <Ionicons name="close" size={26} color={colors.textOnDark} />
      </Pressable>
    </View>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    row: {
      gap: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    item: { width: 64, alignItems: 'center', gap: 4 },
    ring: {
      padding: 2,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: c.accent,
    },
    name: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 11,
      maxWidth: 64,
    },
  });

const makeViewerStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(6, 4, 2, 0.98)',
      zIndex: 100,
      elevation: 100,
    },
    list: { flex: 1 },
    page: {
      width: SCREEN_W,
      height: SCREEN_H,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'stretch',
    },
    headerName: {
      flex: 1,
      color: colors.textOnDark,
      fontFamily: fonts.heading,
      fontSize: 15,
    },
    time: { color: c.muted, fontFamily: fonts.body, fontSize: 12 },
    poster: {
      width: SCREEN_W * 0.6,
      height: SCREEN_W * 0.9,
      borderRadius: radius.md,
    },
    movieTitle: {
      color: colors.textOnDark,
      fontFamily: fonts.heading,
      fontSize: 18,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    caption: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.xl,
      marginTop: spacing.sm,
    },
    actionBtn: { alignItems: 'center', gap: 4 },
    actionLabel: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    close: {
      position: 'absolute',
      top: spacing.xxl,
      right: spacing.lg,
    },
  });
