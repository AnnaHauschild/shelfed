import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthProvider';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

/** Sign out + delete account, pinned to the very bottom of Settings. */
export function AccountActions() {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { enabled, session, signOut, deleteAccount } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled || !session) return null;

  const del = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await deleteAccount();
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.row} onPress={() => signOut()}>
        <Ionicons name="log-out-outline" size={18} color={chrome.muted} />
        <Text style={styles.rowText}>Sign out</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={del} disabled={busy}>
        <Ionicons name="trash-outline" size={18} color={colors.favorite} />
        <Text style={[styles.rowText, { color: colors.favorite }]}>
          {confirmDelete ? 'Tap again to permanently delete' : 'Delete account'}
        </Text>
        {busy && (
          <ActivityIndicator color={colors.favorite} size="small" />
        )}
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
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
    error: {
      color: colors.favorite,
      fontFamily: fonts.body,
      fontSize: 15,
    },
  });
