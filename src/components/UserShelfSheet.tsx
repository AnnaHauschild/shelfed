import { useMemo } from 'react';
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
import { ShelfItem } from '@/api/shelfSync';
import { UserSummary } from '@/api/follows';
import { useUserShelf } from '@/hooks/useUserShelf';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

const SECTIONS: { type: ShelfItem['type']; label: string }[] = [
  { type: 'watched', label: 'Watched' },
  { type: 'favorite', label: 'Favorites' },
  { type: 'watchlist', label: 'Wishlist' },
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
  const empty = !isLoading && (!items || items.length === 0);

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
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && <Text style={styles.hint}>Loading…</Text>}
          {empty && <Text style={styles.hint}>Nothing on this shelf yet.</Text>}
          {!isLoading &&
            items &&
            SECTIONS.map(({ type, label }) => {
              const group = items.filter((i) => i.type === type);
              if (group.length === 0) return null;
              return (
                <View key={type} style={styles.group}>
                  <Text style={styles.section}>
                    {label} ({group.length})
                  </Text>
                  <View style={styles.grid}>
                    {group.map((it) => {
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
                </View>
              );
            })}
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
