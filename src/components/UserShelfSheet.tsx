import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { posterUrl } from '@/api/tmdb';
import { MediaType } from '@/api/types';
import { ShelfItem } from '@/api/shelfSync';
import { UserSummary } from '@/api/follows';
import { useUserShelf } from '@/hooks/useUserShelf';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

const SHELF_TYPES: { type: ShelfItem['type']; label: string }[] = [
  { type: 'watched', label: 'Watched' },
  { type: 'favorite', label: 'Liked' },
  { type: 'watchlist', label: 'Wishlist' },
];

const MEDIA_TYPES: { key: MediaType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'Series' },
  { key: 'book', label: 'Books' },
  { key: 'game', label: 'Games' },
];

/** Read-only view of a followed user's shelves (watched / favorites / wishlist). */
export function UserShelfSheet({
  user,
  onClose,
}: {
  user: UserSummary | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { data: items, isLoading } = useUserShelf(user?.id ?? null);
  const [shelfType, setShelfType] = useState<ShelfItem['type']>('watched');
  const [media, setMedia] = useState<MediaType | 'all'>('all');

  const shown = (items ?? []).filter(
    (i) => i.type === shelfType && (media === 'all' || i.mediaType === media),
  );

  return (
    <Modal
      visible={!!user}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            @{user?.username}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={chrome.muted} />
          </Pressable>
        </View>

        <View style={styles.chipRow}>
          {SHELF_TYPES.map((t) => {
            const active = shelfType === t.type;
            return (
              <Pressable
                key={t.type}
                onPress={() => setShelfType(t.type)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.chipRow}>
          {MEDIA_TYPES.map((m) => {
            const active = media === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMedia(m.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && <Text style={styles.hint}>Loading…</Text>}
          {!isLoading && shown.length === 0 && (
            <Text style={styles.hint}>Nothing here.</Text>
          )}
          <View style={styles.grid}>
            {shown.map((it) => {
              const uri = posterUrl(it.posterPath);
              return (
                <View
                  key={`${it.mediaType}:${it.movieId}`}
                  style={styles.poster}
                >
                  {uri ? (
                    <Image
                      source={{ uri }}
                      style={styles.posterImg}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.posterImg, styles.posterFallback]}>
                      <Ionicons
                        name="image-outline"
                        size={20}
                        color={chrome.muted}
                      />
                    </View>
                  )}
                  <Text style={styles.posterTitle} numberOfLines={2}>
                    {it.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const POSTER_W = 84;

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 6, 2, 0.6)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '86%',
      backgroundColor: c.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 2,
      borderColor: c.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      paddingTop: spacing.sm,
    },
    handle: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    title: {
      flex: 1,
      color: c.accent,
      fontFamily: fonts.display,
      fontSize: 20,
      letterSpacing: 1,
    },
    content: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    hint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 13,
      paddingVertical: spacing.sm,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
    },
    chipActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    chipText: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 12,
    },
    chipTextActive: {
      color: c.onAccent,
    },
    group: {
      marginBottom: spacing.md,
    },
    section: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    poster: {
      width: POSTER_W,
    },
    posterImg: {
      width: POSTER_W,
      height: POSTER_W * 1.5,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
    },
    posterFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    posterTitle: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 4,
    },
  });
