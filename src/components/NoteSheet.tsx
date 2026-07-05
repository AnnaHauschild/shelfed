import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { useNote, useSaveNote } from '@/hooks/useNotes';
import { colors, fonts, radius, spacing } from '@/theme';

// Warm sticky-note paper tones (kept local — this is the only post-it surface).
const NOTE_PAPER = '#f2e2a0';
const NOTE_INK = '#3a2a12';
const NOTE_INK_MUTED = '#8a6f3c';

interface Props {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
}

/**
 * A post-it style overlay for jotting a personal note about a title. Rendered
 * inside the details modal (as an overlay, not a nested RN Modal). Saves on
 * close (Done or tapping outside); an empty note is cleared.
 */
export function NoteSheet({ movie, visible, onClose }: Props) {
  const { data: saved } = useNote(movie?.id ?? '', movie?.mediaType ?? 'movie');
  const save = useSaveNote();
  const [text, setText] = useState('');

  // Load the stored note whenever the post-it opens.
  useEffect(() => {
    if (visible) setText(saved ?? '');
  }, [visible, saved]);

  if (!visible || !movie) return null;

  const close = async () => {
    await save(movie.id, movie.mediaType, text);
    onClose();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={styles.note}>
        <View style={styles.tape} />
        <View style={styles.header}>
          <Ionicons name="reader-outline" size={16} color={NOTE_INK_MUTED} />
          <Text style={styles.title} numberOfLines={1}>
            Notes · {movie.title}
          </Text>
          <Pressable onPress={close} hitSlop={8}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Write your thoughts, favourite scenes, who you watched it with…"
          placeholderTextColor={NOTE_INK_MUTED}
          multiline
          autoFocus
          textAlignVertical="top"
          scrollEnabled
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  note: {
    backgroundColor: NOTE_PAPER,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    minHeight: 260,
    shadowColor: colors.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  tape: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 90,
    height: 20,
    backgroundColor: 'rgba(244, 228, 193, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(90, 65, 40, 0.25)',
    transform: [{ rotate: '-2deg' }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    color: NOTE_INK,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  done: {
    color: NOTE_INK,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    minHeight: 160,
    color: NOTE_INK,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
});
