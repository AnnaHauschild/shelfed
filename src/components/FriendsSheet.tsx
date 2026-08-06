import { useMemo, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFollows } from '@/hooks/useFollows';
import { useUserSearch } from '@/hooks/useUserSearch';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { UserSummary } from '@/api/follows';
import { UserShelfSheet } from './UserShelfSheet';

const SCREEN_H = Dimensions.get('window').height;

/**
 * Find people by @username and follow / unfollow them. Opened from the Account
 * section when signed in. Following someone lets you see their shelves.
 */
export function FriendsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const [query, setQuery] = useState('');
  const [viewUser, setViewUser] = useState<UserSummary | null>(null);
  const { results, loading } = useUserSearch(query);
  const { following, isFollowing, follow, unfollow } = useFollows();

  const searching = query.trim().length >= 2;

  const userRow = (
    id: string,
    username: string,
    followed: boolean,
    onOpen?: () => void,
  ) => (
    <View key={id} style={styles.userRow}>
      <Pressable style={styles.userTap} onPress={onOpen} disabled={!onOpen}>
        <Ionicons name="person-circle" size={30} color={chrome.muted} />
        <Text style={styles.username} numberOfLines={1}>
          @{username}
        </Text>
      </Pressable>
      <Pressable
        style={[styles.followBtn, followed && styles.followingBtn]}
        onPress={() => (followed ? unfollow(id) : follow(id))}
      >
        <Text style={[styles.followText, followed && styles.followingText]}>
          {followed ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>Friends</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={chrome.muted} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={chrome.muted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Find people by username"
            placeholderTextColor={chrome.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {searching ? (
            <>
              <Text style={styles.section}>Results</Text>
              {loading && <Text style={styles.hint}>Searching…</Text>}
              {!loading && results.length === 0 && (
                <Text style={styles.hint}>No one found.</Text>
              )}
              {results.map((u) =>
                userRow(
                  u.id,
                  u.username,
                  isFollowing(u.id),
                  isFollowing(u.id) ? () => setViewUser(u) : undefined,
                ),
              )}
            </>
          ) : (
            <>
              <Text style={styles.section}>Following ({following.length})</Text>
              {following.length === 0 && (
                <Text style={styles.hint}>
                  You&apos;re not following anyone yet. Search above to find
                  friends.
                </Text>
              )}
              {following.map((u) =>
                userRow(u.id, u.username, true, () => setViewUser(u)),
              )}
            </>
          )}
        </ScrollView>
      </View>
      </KeyboardAvoidingView>
      <UserShelfSheet user={viewUser} onClose={() => setViewUser(null)} />
    </Modal>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 6, 2, 0.6)',
    },
    sheet: {
      maxHeight: '82%',
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
      color: c.accent,
      fontFamily: fonts.display,
      fontSize: 22,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
    },
    input: {
      flex: 1,
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
      paddingVertical: 2,
    },
    content: {
      paddingTop: spacing.md,
      gap: spacing.xs,
      paddingBottom: spacing.md,
    },
    section: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    hint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 13,
      paddingVertical: spacing.xs,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    userTap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    username: {
      flex: 1,
      color: colors.textOnDark,
      fontFamily: fonts.label,
      fontSize: 15,
    },
    followBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.xl,
      backgroundColor: c.accent,
    },
    followingBtn: {
      backgroundColor: c.surfaceRaised,
      borderWidth: 1,
      borderColor: c.border,
    },
    followText: {
      color: c.onAccent,
      fontFamily: fonts.label,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    followingText: {
      color: c.muted,
    },
  });
