import { useEffect, useState } from 'react';
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
  const uri = posterUrl(path, 'w185');
  const dims = { width: size, height: size, borderRadius: size / 2 };
  if (!uri) {
    return (
      <View style={[styles.avatar, styles.avatarFallback, dims]}>
        <Ionicons name="person" size={size * 0.55} color={colors.textOnDarkMuted} />
      </View>
    );
  }
  return <Image source={{ uri }} style={[styles.avatar, dims]} contentFit="cover" />;
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
        <Ionicons name="close" size={16} color={colors.textOnDarkMuted} />
      </Pressable>
    );
  }

  return (
    <View>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={16} color={colors.textOnDarkMuted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search an actor…"
          placeholderTextColor={colors.textOnDarkMuted}
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator size="small" color={colors.textOnDarkMuted} />
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

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
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
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultRowPressed: {
    backgroundColor: `${colors.favorite}22`,
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
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1,
  },
  avatar: {
    backgroundColor: colors.background,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
