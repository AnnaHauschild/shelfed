import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthProvider';
import {
  deleteAllShelfItems,
  deleteShelfItemsScoped,
  isShelfType,
} from '@/api/shelfSync';
import type { ShelfType } from '@/api/shelfSync';
import type { MediaType } from '@/api/types';
import {
  collectionRepository,
  episodeRepository,
  interactionRepository,
  noteRepository,
} from '@/repositories';
import type { InteractionType } from '@/repositories';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

// Every cache that reflects shelf / mood / stats / note content.
const CACHE_KEYS = [
  'shelf',
  'interaction-states',
  'watched-stats',
  'moods',
  'mood',
  'mood-ids',
  'mood-summary',
  'note',
  'user-shelf',
];

// The three shelves the user can individually clear.
const SHELVES: { type: InteractionType; label: string }[] = [
  { type: 'watched', label: 'Shelf' },
  { type: 'watchlist', label: 'Wishlist' },
  { type: 'favorite', label: 'Favorites' },
];

// The media categories that can be scoped when clearing.
const MEDIA: { type: MediaType; label: string }[] = [
  { type: 'movie', label: 'Movies' },
  { type: 'tv', label: 'Series' },
  { type: 'book', label: 'Books' },
  { type: 'game', label: 'Games' },
];

/** "Reset" options in Settings: clear selected shelves, or wipe everything. */
export function DataActions() {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<null | 'shelves' | 'all'>(null);
  const [shelvesOpen, setShelvesOpen] = useState(false);
  const [selected, setSelected] = useState<Set<InteractionType>>(
    new Set(['watched', 'watchlist', 'favorite']),
  );
  const [selectedMedia, setSelectedMedia] = useState<Set<MediaType>>(
    new Set(['movie', 'tv', 'book', 'game']),
  );

  const invalidate = () =>
    CACHE_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));

  const cloudNote = userId
    ? ' on this device and in the cloud'
    : ' on this device';

  const toggle = (t: InteractionType) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const toggleMedia = (t: MediaType) =>
    setSelectedMedia((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const clearSelected = async () => {
    const types = SHELVES.map((s) => s.type).filter((t) => selected.has(t));
    const media = MEDIA.map((m) => m.type).filter((t) => selectedMedia.has(t));
    if (types.length === 0 || media.length === 0) return;
    setBusy('shelves');
    try {
      await interactionRepository.clearScoped(types, media);
      if (userId) {
        await deleteShelfItemsScoped(userId, types.filter(isShelfType), media);
      }
    } finally {
      invalidate();
      setBusy(null);
      setShelvesOpen(false);
    }
  };

  const resetEverything = async () => {
    setBusy('all');
    try {
      await interactionRepository.clearAll();
      await collectionRepository.clearAll();
      await noteRepository.clearAll();
      await episodeRepository.clearAll();
      if (userId) await deleteAllShelfItems(userId);
    } finally {
      invalidate();
      setBusy(null);
    }
  };

  const confirmClearSelected = () => {
    const chosen = SHELVES.filter((s) => selected.has(s.type));
    const chosenMedia = MEDIA.filter((m) => selectedMedia.has(m.type));
    if (chosen.length === 0 || chosenMedia.length === 0) return;
    const shelfNames = chosen.map((s) => s.label).join(', ');
    const mediaNames =
      chosenMedia.length === MEDIA.length
        ? 'all categories'
        : chosenMedia.map((m) => m.label).join(', ');
    Alert.alert(
      'Clear shelves?',
      `This empties ${shelfNames} for ${mediaNames}${cloudNote}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearSelected },
      ],
    );
  };

  const confirmResetAll = () =>
    Alert.alert(
      'Reset everything?',
      `This permanently deletes all shelves, moods, notes and episode progress${cloudNote}. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetEverything },
      ],
    );

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>Data</Text>

      <Pressable
        style={styles.row}
        onPress={() => setShelvesOpen((v) => !v)}
        disabled={busy !== null}
      >
        <Ionicons name="refresh-outline" size={18} color={chrome.muted} />
        <Text style={styles.rowText}>Clear shelves…</Text>
        <Ionicons
          name={shelvesOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={chrome.muted}
          style={styles.chevron}
        />
      </Pressable>

      {shelvesOpen && (
        <View style={styles.panel}>
          <Text style={styles.hint}>
            Choose which shelves and categories to empty.
          </Text>
          <Text style={styles.subLabel}>Lists</Text>
          <View style={styles.chips}>
            {SHELVES.map((s) => {
              const on = selected.has(s.type);
              return (
                <Pressable
                  key={s.type}
                  onPress={() => toggle(s.type)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.subLabel}>Categories</Text>
          <View style={styles.chips}>
            {MEDIA.map((m) => {
              const on = selectedMedia.has(m.type);
              return (
                <Pressable
                  key={m.type}
                  onPress={() => toggleMedia(m.type)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={[
              styles.clearBtn,
              (selected.size === 0 ||
                selectedMedia.size === 0 ||
                busy !== null) &&
                styles.clearBtnOff,
            ]}
            onPress={confirmClearSelected}
            disabled={
              selected.size === 0 || selectedMedia.size === 0 || busy !== null
            }
          >
            {busy === 'shelves' ? (
              <ActivityIndicator color={chrome.onAccent} size="small" />
            ) : (
              <Text style={styles.clearBtnText}>Clear selected</Text>
            )}
          </Pressable>
        </View>
      )}

      <Pressable
        style={styles.row}
        onPress={confirmResetAll}
        disabled={busy !== null}
      >
        <Ionicons name="trash-bin-outline" size={18} color={colors.favorite} />
        <Text style={[styles.rowText, { color: colors.favorite }]}>
          Reset everything
        </Text>
        {busy === 'all' && (
          <ActivityIndicator color={colors.favorite} size="small" />
        )}
      </Pressable>
    </View>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    wrap: {
      marginTop: spacing.xl,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: spacing.xs,
    },
    section: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    rowText: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 17,
    },
    chevron: { marginLeft: 'auto' },
    panel: {
      paddingLeft: 26,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    hint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 14,
    },
    subLabel: {
      color: colors.textOnDark,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.xs,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipOn: { backgroundColor: c.accent, borderColor: c.accent },
    chipText: { color: colors.textOnDark, fontFamily: fonts.body, fontSize: 15 },
    chipTextOn: { color: c.onAccent },
    clearBtn: {
      alignSelf: 'flex-start',
      backgroundColor: c.accent,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs + 2,
      minWidth: 130,
      alignItems: 'center',
    },
    clearBtnOff: { opacity: 0.5 },
    clearBtnText: {
      color: c.onAccent,
      fontFamily: fonts.label,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
