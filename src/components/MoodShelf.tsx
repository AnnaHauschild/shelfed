import { useMemo, useState } from 'react';
import {
  Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@/components/EmptyState';
import { MediaSwitcher } from '@/components/MediaSwitcher';
import {
  MovieDetailsProvider,
  useMovieDetails,
} from '@/components/MovieDetailsProvider';
import { PosterImage } from '@/components/PosterImage';
import { ShelfBackground } from '@/components/ShelfBackground';
import { ShelfRack } from '@/components/ShelfRack';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useMood, useMoodMovies, useMoodMutations } from '@/hooks/useMoods';
import { useShelf } from '@/hooks/useShelf';
import { InteractionType } from '@/repositories';
import { colors, fonts, radius, spacing } from '@/theme';

const H_PADDING = spacing.lg;
const { width } = Dimensions.get('window');
const CONTAINER_WIDTH = width - H_PADDING * 2;

interface Props {
  moodId: number | null;
  onClose: () => void;
  /** Which shelf the + picker draws its titles from (defaults to watched). */
  sourceType?: InteractionType;
}

/**
 * Full-screen view of a single Mood — a personal shelf. Wraps its body in a
 * local MovieDetailsProvider so tapping a title opens the details card ON TOP of
 * this modal (a root-level details modal would otherwise appear behind it).
 */
export function MoodShelf({ moodId, onClose, sourceType = 'watched' }: Props) {
  return (
    <Modal visible={moodId != null} animationType="slide" onRequestClose={onClose}>
      <MovieDetailsProvider>
        <MoodShelfBody moodId={moodId} onClose={onClose} sourceType={sourceType} />
      </MovieDetailsProvider>
    </Modal>
  );
}

function MoodShelfBody({ moodId, onClose, sourceType = 'watched' }: Props) {
  const insets = useSafeAreaInsets();
  const { open } = useMovieDetails();
  const states = useInteractionStates();
  const { data: mood } = useMood(moodId);
  const { data: movies } = useMoodMovies(moodId);
  const { addToMood, removeFromMood, updateMood, deleteMood } =
    useMoodMutations();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [renameText, setRenameText] = useState<string | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const items = useMemo(() => movies ?? [], [movies]);
  // Set of "<mediaType>:<id>" already in this mood, for the picker checkmarks.
  const memberKeys = useMemo(
    () => new Set(items.map((m) => `${m.mediaType}:${m.id}`)),
    [items],
  );

  const saveRename = async () => {
    const trimmed = (renameText ?? '').trim();
    if (mood && trimmed) await updateMood(mood.id, trimmed);
    setRenameText(null);
  };

  const confirmDelete = () => {
    if (!mood) return;
    setOptionsOpen(false);
    Alert.alert(
      `Delete "${mood.name}"?`,
      'This removes the mood shelf. Your titles stay on your main shelf.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMood(mood.id);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ShelfBackground variant="wall" />

      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={8} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textOnDark} />
        </Pressable>
        <Pressable
          style={styles.headerTitleWrap}
          onLongPress={() => setOptionsOpen(true)}
          delayLongPress={300}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {mood?.name}
          </Text>
          <Text style={styles.headerHint}>Hold for options</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="sparkles-outline"
          title="This mood is empty"
          message="Tap the + button to add titles from your watched shelf."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <ShelfRack
            movies={items}
            onOpen={open}
            isWatchlisted={(id) => states.isWatchlisted(id)}
            isFavorite={(id) => states.isFavorite(id)}
            containerWidth={CONTAINER_WIDTH}
          />
        </ScrollView>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + spacing.lg },
          pressed && styles.pressed,
        ]}
        onPress={() => setPickerOpen(true)}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </Pressable>

      {pickerOpen && mood && (
        <AddPicker
          moodId={mood.id}
          sourceType={sourceType}
          memberKeys={memberKeys}
          onAdd={(m) => addToMood(mood.id, m.id, m.mediaType)}
          onRemove={(m) => removeFromMood(mood.id, m.id, m.mediaType)}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {optionsOpen && (
        <View style={styles.pickerRoot}>
          <Pressable
            style={styles.pickerBackdrop}
            onPress={() => setOptionsOpen(false)}
          />
          <View
            style={[styles.optionsSheet, { paddingBottom: insets.bottom + spacing.md }]}
          >
            <View style={styles.handle} />
            <Pressable
              style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
              onPress={() => {
                setOptionsOpen(false);
                setRenameText(mood?.name ?? '');
              }}
            >
              <Ionicons name="create-outline" size={20} color={colors.textOnDark} />
              <Text style={styles.optionText}>Rename</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
              onPress={confirmDelete}
            >
              <Ionicons name="trash-outline" size={20} color={colors.skip} />
              <Text style={[styles.optionText, { color: colors.skip }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}

      {renameText != null && (
        <KeyboardAvoidingView
          style={styles.renameRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.pickerBackdrop}
            onPress={() => setRenameText(null)}
          />
          <View style={[styles.renameSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.handle} />
            <Text style={styles.renameLabel}>Rename mood</Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Mood name"
              placeholderTextColor={colors.textOnDarkMuted}
              maxLength={40}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveRename}
            />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setRenameText(null)} hitSlop={8}>
                <Text style={styles.renameCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.renameSave,
                  !renameText.trim() && styles.renameSaveDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={saveRename}
                disabled={!renameText.trim()}
              >
                <Text style={styles.renameSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

/** Inline overlay picker: the source shelf with a checkmark to toggle membership. */
function AddPicker({
  moodId,
  sourceType,
  memberKeys,
  onAdd,
  onRemove,
  onClose,
}: {
  moodId: number;
  sourceType: InteractionType;
  memberKeys: Set<string>;
  onAdd: (m: { id: string; mediaType: 'movie' | 'tv' | 'book' }) => void;
  onRemove: (m: { id: string; mediaType: 'movie' | 'tv' | 'book' }) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { data: watched } = useShelf(sourceType);
  const rows = watched ?? [];

  return (
    <View style={styles.pickerRoot}>
      <Pressable style={styles.pickerBackdrop} onPress={onClose} />
      <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Add from your shelf</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.pickerDone}>Done</Text>
          </Pressable>
        </View>
        <View style={styles.pickerSwitcher}>
          <MediaSwitcher />
        </View>

        {rows.length === 0 ? (
          <Text style={styles.pickerEmpty}>
            Nothing on this shelf yet — add some titles first.
          </Text>
        ) : (
          <ScrollView
            style={styles.pickerList}
            contentContainerStyle={styles.pickerListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {rows.map((m) => {
              const inMood = memberKeys.has(`${m.mediaType}:${m.id}`);
              return (
                <Pressable
                  key={`${m.mediaType}:${m.id}`}
                  style={({ pressed }) => [
                    styles.pickerRow,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => (inMood ? onRemove(m) : onAdd(m))}
                >
                  <PosterImage
                    posterPath={m.posterPath}
                    title={m.title}
                    style={styles.pickerPoster}
                  />
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName} numberOfLines={1}>
                      {m.title}
                    </Text>
                    {m.year ? (
                      <Text style={styles.pickerYear}>{m.year}</Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name={inMood ? 'checkmark-circle' : 'add-circle-outline'}
                    size={26}
                    color={inMood ? colors.watched : colors.textOnDarkMuted}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerBtn: {
    padding: 2,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: 22,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerHint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 1,
  },
  list: {
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amberBright,
    shadowColor: colors.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  // Picker overlay
  pickerRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  pickerSheet: {
    maxHeight: '75%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  pickerTitle: {
    color: colors.amberBright,
    fontFamily: fonts.display,
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pickerDone: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerSwitcher: {
    marginBottom: spacing.sm,
  },
  pickerList: {
    flexGrow: 0,
  },
  pickerListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerPoster: {
    width: 40,
    height: 60,
    borderRadius: radius.sm,
  },
  pickerInfo: {
    flex: 1,
  },
  pickerName: {
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 15,
  },
  pickerYear: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1,
  },
  pickerEmpty: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  // Rename overlay
  renameRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  optionText: {
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  renameSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  renameLabel: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  renameInput: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  renameActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  renameCancel: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  renameSave: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.amberBright,
  },
  renameSaveDisabled: {
    opacity: 0.4,
  },
  renameSaveText: {
    color: colors.background,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
