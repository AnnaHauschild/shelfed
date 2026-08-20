import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthorHit, searchAuthors } from '@/api/openLibrary';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

export interface SelectedAuthor {
  key: string;
  name: string;
  topWork?: string;
}

interface Props {
  selected: SelectedAuthor | null;
  onSelect: (author: SelectedAuthor | null) => void;
}

/**
 * Author filter: type a name, pick from the live Open Library author search,
 * and the Discover books feed is limited to that author (via author_key). Shows
 * the pick as a removable chip; tapping it clears the filter.
 */
export function AuthorFilter({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AuthorHit[]>([]);
  const [loading, setLoading] = useState(false);
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);

  // Debounced live search; skipped while an author is already selected.
  useEffect(() => {
    const q = query.trim();
    if (selected || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let alive = true;
    const timer = setTimeout(() => {
      searchAuthors(q)
        .then((hits) => alive && setResults(hits))
        .catch(() => alive && setResults([]))
        .finally(() => alive && setLoading(false));
    }, 350);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query, selected]);

  if (selected) {
    return (
      <Pressable
        style={styles.selectedChip}
        onPress={() => {
          onSelect(null);
          setQuery('');
        }}
      >
        <Ionicons name="person" size={16} color={chrome.muted} />
        <Text style={styles.selectedText} numberOfLines={1}>
          {selected.name}
        </Text>
        <Ionicons name="close" size={16} color={chrome.muted} />
      </Pressable>
    );
  }

  return (
    <View>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={16} color={chrome.muted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search an author…"
          placeholderTextColor={chrome.muted}
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={chrome.muted} />}
      </View>
      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((a) => (
            <Pressable
              key={a.key}
              style={({ pressed }) => [
                styles.resultRow,
                pressed && styles.resultRowPressed,
              ]}
              onPress={() => {
                onSelect({ key: a.key, name: a.name, topWork: a.topWork });
                setQuery('');
              }}
            >
              <View style={styles.icon}>
                <Ionicons name="person" size={18} color={chrome.muted} />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>
                  {a.name}
                </Text>
                {a.topWork ? (
                  <Text style={styles.resultHint} numberOfLines={1}>
                    {a.topWork}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
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
    results: {
      marginTop: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
      overflow: 'hidden',
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    resultRowPressed: {
      backgroundColor: `${c.accent}22`,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      backgroundColor: c.background,
      borderColor: c.border,
    },
    resultInfo: { flex: 1 },
    resultName: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
    },
    resultHint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 12,
    },
    selectedChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.accent,
      backgroundColor: `${c.accent}22`,
    },
    selectedText: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 14,
      maxWidth: 200,
    },
  });
