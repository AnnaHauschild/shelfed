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
import { deleteAllShelfItems } from '@/api/shelfSync';
import {
  collectionRepository,
  episodeRepository,
  interactionRepository,
  noteRepository,
} from '@/repositories';
import { colors, fonts, spacing } from '@/theme';
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

/** "Reset" options in Settings: empty the shelves, or wipe everything local. */
export function DataActions() {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<null | 'shelves' | 'all'>(null);

  const invalidate = () =>
    CACHE_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));

  const clearShelves = async () => {
    setBusy('shelves');
    try {
      await interactionRepository.clearAll();
      if (userId) await deleteAllShelfItems(userId);
    } finally {
      invalidate();
      setBusy(null);
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

  const cloudNote = userId
    ? ' on this device and in the cloud'
    : ' on this device';

  const confirmClearShelves = () =>
    Alert.alert(
      'Clear shelves?',
      `This empties your Watched, Wishlist and Favorites${cloudNote}. Moods, notes and episode progress are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearShelves },
      ],
    );

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
        onPress={confirmClearShelves}
        disabled={busy !== null}
      >
        <Ionicons name="refresh-outline" size={18} color={chrome.muted} />
        <Text style={styles.rowText}>Clear shelves</Text>
        {busy === 'shelves' && (
          <ActivityIndicator color={chrome.muted} size="small" />
        )}
      </Pressable>
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
      fontSize: 15,
    },
  });
