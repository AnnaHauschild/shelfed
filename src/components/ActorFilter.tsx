import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PersonHit, searchPeople } from '@/api/movies';
import { posterUrl } from '@/api/tmdb';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

export interface SelectedActor {
  id: string;
  name: string;
  profilePath?: string | null;
}

interface Props {
  selected: SelectedActor | null;
  onSelect: (actor: SelectedActor | null) => void;
}

/** Small round actor avatar with a person-icon fallback. */
function Avatar({ path, size }: { path: string | null; size: number }) {
  const chrome = useThemeChrome();
  const uri = posterUrl(path, 'w185');
  const dims = { width: size, height: size, borderRadius: size / 2 };
  if (!uri) {
    return (
      <View
        style={[
          dims,
          {
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            backgroundColor: chrome.background,
            borderColor: chrome.border,
          },
        ]}
      >
        <Ionicons name="person" size={size * 0.55} color={chrome.muted} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={[dims, { backgroundColor: chrome.background }]}
      contentFit="cover"
    />
  );
}

/**
 * Actor filter: type a name, pick from the live TMDB people search, and the
 * Discover feed is limited to that actor's films (via with_cast). Shows the
 * pick as a removable chip; tapping it clears the filter.
 */
export function ActorFilter({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PersonHit[]>([]);
  const [loading, setLoading] = useState(false);
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);

  // Debounced live search; skipped while an actor is already selected.
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
      searchPeople(q)
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
        <Avatar path={selected.profilePath ?? null} size={22} />
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
          placeholder="Search an actor…"
          placeholderTextColor={chrome.muted}
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator size="small" color={chrome.muted} />
        )}
      </View>
      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((p) => (
            <Pressable
              key={p.id}
              style={({ pressed }) => [
                styles.resultRow,
                pressed && styles.resultRowPressed,
              ]}
              onPress={() => {
                onSelect({ id: p.id, name: p.name, profilePath: p.profilePath });
                setQuery('');
              }}
            >
              <Avatar path={p.profilePath} size={40} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>
                  {p.name}
                </Text>
                {p.knownFor ? (
                  <Text style={styles.resultHint} numberOfLines={1}>
                    {p.knownFor}
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
    resultInfo: {
      flex: 1,
    },
    resultName: {
      color: colors.textOnDark,
      fontFamily: fonts.label,
      fontSize: 14,
    },
    resultHint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 12,
      marginTop: 1,
    },
    selectedChip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.favorite,
      backgroundColor: `${colors.favorite}22`,
    },
    selectedText: {
      color: colors.favorite,
      fontFamily: fonts.label,
      fontSize: 13,
      maxWidth: 220,
    },
  });
