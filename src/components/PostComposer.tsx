import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { CardLayout, EmojiOverlay, Overlay, Sticker, TextOverlay } from '@/api/posts';
import { useCreatePost } from '@/hooks/useStories';
import { fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import {
  CARD_RATIO,
  EditableCard,
  EditableOverlay,
  fontFamilyFor,
  storyPalette,
  STORY_COLORS,
  STORY_FONTS,
} from './StoryOverlays';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
// The 9:16 stage; the card fills it at scale 1 and can be shrunk within it.
const STAGE_W = Math.min(SCREEN_W - spacing.lg * 2, (SCREEN_H - 300) / CARD_RATIO);
const STAGE_H = STAGE_W * CARD_RATIO;

const uid = () => Math.random().toString(36).slice(2, 10);
// Dark ink for chrome on the light (film-tinted) stage.
const INK = '#2b1d0d';

/** Instagram-style story editor: poster + draggable text/emoji stickers. */
export function PostComposer({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const create = useCreatePost();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [card, setCard] = useState({ tx: 0, ty: 0, scale: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (movie) {
      setStickers([]);
      setCard({ tx: 0, ty: 0, scale: 1 });
      setSelectedId(null);
      setEditingId(null);
    }
  }, [movie]);

  if (!movie) return null;

  const update = (
    id: string,
    patch: Partial<TextOverlay> & Partial<EmojiOverlay>,
  ) =>
    setStickers((v) =>
      v.map((o) => (o.id === id ? ({ ...o, ...patch } as Sticker) : o)),
    );
  const remove = (id: string) => {
    setStickers((v) => v.filter((o) => o.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  };
  const addText = () => {
    const o: TextOverlay = {
      id: uid(),
      kind: 'text',
      text: '',
      font: 'display',
      color: '#ffffff',
      tx: 0,
      ty: 0,
      scale: 1,
    };
    setStickers((v) => [...v, o]);
    setSelectedId(o.id);
    setEditingId(o.id);
  };
  const finishEdit = () => {
    setStickers((v) =>
      v.filter(
        (o) => !(o.id === editingId && o.kind === 'text' && !o.text.trim()),
      ),
    );
    setEditingId(null);
  };
  const post = () => {
    const clean = stickers.filter(
      (o) => o.kind !== 'text' || o.text.trim().length > 0,
    );
    const cardEl: CardLayout = { id: 'card', kind: 'card', ...card };
    create.mutate(
      {
        movie: {
          id: movie.id,
          mediaType: movie.mediaType,
          title: movie.title,
          posterPath: movie.posterPath,
          year: movie.year,
        },
        caption: '',
        overlays: [cardEl, ...clean] as Overlay[],
      },
      { onSuccess: onClose },
    );
  };

  const palette = storyPalette(movie.title ?? movie.id);
  const cardLayout: CardLayout = { id: 'card', kind: 'card', ...card };
  const selected = stickers.find((o) => o.id === selectedId) ?? null;
  const selectedText = selected && selected.kind === 'text' ? selected : null;
  const editing =
    editingId != null
      ? (stickers.find((o) => o.id === editingId && o.kind === 'text') as
          | TextOverlay
          | undefined)
      : undefined;

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: palette.bg }]}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={26} color={INK} />
        </Pressable>
        <View style={styles.tools}>
          <Pressable onPress={addText} style={styles.tool} hitSlop={6}>
            <Text style={styles.toolAa}>Aa</Text>
          </Pressable>
          {selected && (
            <Pressable onPress={() => remove(selected.id)} style={styles.tool} hitSlop={6}>
              <Ionicons name="trash-outline" size={22} color={INK} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.canvasWrap}>
        <View style={[styles.stage, { width: STAGE_W, height: STAGE_H }]}>
          <EditableCard
            key={movie.id}
            layout={cardLayout}
            stageW={STAGE_W}
            stageH={STAGE_H}
            title={movie.title}
            posterPath={movie.posterPath}
            year={movie.year}
            cardColor={palette.card}
            textColor={palette.text}
            onChange={(patch) => setCard((c) => ({ ...c, ...patch }))}
          />
          {stickers.map((o) => (
            <EditableOverlay
              key={o.id}
              overlay={o}
              canvasW={STAGE_W}
              canvasH={STAGE_H}
              selected={selectedId === o.id}
              onSelect={setSelectedId}
              onEditText={(id) => {
                setSelectedId(id);
                setEditingId(id);
              }}
              onChange={update}
            />
          ))}
        </View>
      </View>

      {selectedText && !editing && (
        <View style={styles.quickBar}>
          {STORY_FONTS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => update(selectedText.id, { font: f.key })}
              style={[styles.chipLight, selectedText.font === f.key && styles.chipLightOn]}
            >
              <Text style={{ fontFamily: f.family, color: INK, fontSize: 14 }}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={[styles.postBtn, create.isPending && styles.postBtnOff]}
          onPress={post}
          disabled={create.isPending}
        >
          {create.isPending ? (
            <ActivityIndicator color={chrome.onAccent} size="small" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={16} color={chrome.onAccent} />
              <Text style={styles.postText}>Share to friends</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.hint}>
          Only your accepted friends can see this. Disappears after 24h.
        </Text>
      </View>

      {editing && (
        <KeyboardAvoidingView
          style={styles.editRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.editBackdrop} onPress={finishEdit} />
          <View style={styles.editCenter} pointerEvents="box-none">
            <TextInput
              autoFocus
              multiline
              value={editing.text}
              onChangeText={(t) => update(editing.id, { text: t })}
              placeholder="Type…"
              placeholderTextColor="rgba(255,255,255,0.6)"
              maxLength={160}
              style={[
                styles.editInput,
                { fontFamily: fontFamilyFor(editing.font), color: editing.color },
              ]}
            />
          </View>
          <View style={[styles.editBar, { paddingBottom: insets.bottom + spacing.sm }]}>
            <View style={styles.colorRow}>
              {STORY_COLORS.map((col) => (
                <Pressable
                  key={col}
                  onPress={() => update(editing.id, { color: col })}
                  style={[
                    styles.swatch,
                    { backgroundColor: col },
                    editing.color === col && styles.swatchOn,
                  ]}
                />
              ))}
            </View>
            <View style={styles.fontRow}>
              {STORY_FONTS.map((f) => (
                <Pressable
                  key={f.key}
                  onPress={() => update(editing.id, { font: f.key })}
                  style={[styles.fontChip, editing.font === f.key && styles.fontChipOn]}
                >
                  <Text style={{ fontFamily: f.family, color: '#fff', fontSize: 15 }}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
              <Pressable onPress={finishEdit} style={styles.doneBtn}>
                <Text style={styles.doneTxt}>Done</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </GestureHandlerRootView>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(8, 5, 3, 0.98)',
      zIndex: 200,
      elevation: 200,
    },
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    tools: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    tool: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.06)',
    },
    toolAa: { color: INK, fontFamily: fonts.display, fontSize: 18 },
    canvasWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stage: { position: 'relative' },
    quickBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    fontChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    fontChipOn: { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: '#fff' },
    chipLight: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.25)',
    },
    chipLightOn: { backgroundColor: 'rgba(0,0,0,0.12)', borderColor: INK },
    footer: { paddingHorizontal: spacing.lg, gap: spacing.sm },
    postBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: c.accent,
      borderRadius: radius.xl,
      paddingVertical: spacing.sm + 2,
    },
    postBtnOff: { opacity: 0.6 },
    postText: {
      color: c.onAccent,
      fontFamily: fonts.label,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    hint: {
      color: 'rgba(43,29,13,0.55)',
      fontFamily: fonts.body,
      fontSize: 12,
      textAlign: 'center',
    },
    paletteRoot: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
    paletteBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    palette: {
      maxHeight: '55%',
      backgroundColor: c.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 2,
      borderColor: c.border,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    paletteHandle: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    emojiCell: {
      width: '12%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiTxt: { fontSize: 30 },
    editRoot: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    editBackdrop: { ...StyleSheet.absoluteFillObject },
    editCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    editInput: {
      minWidth: 80,
      fontSize: 30,
      textAlign: 'center',
    },
    editBar: { paddingHorizontal: spacing.lg, gap: spacing.md },
    colorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    swatch: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.4)',
    },
    swatchOn: { borderColor: '#fff', borderWidth: 3 },
    fontRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    doneBtn: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      backgroundColor: c.accent,
    },
    doneTxt: {
      color: c.onAccent,
      fontFamily: fonts.label,
      fontSize: 14,
      textTransform: 'uppercase',
    },
  });
