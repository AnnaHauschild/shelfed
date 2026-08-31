import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import {
  CaptionMeta,
  CaptionStyle,
  EmojiOverlay,
  GifOverlay,
  Overlay,
  Sticker,
  TextOverlay,
  TextVariant,
} from '@/api/posts';
import { useCreatePost } from '@/hooks/useStories';
import { GifResult, hasGiphyKey, searchGifs } from '@/api/giphy';
import { POSTER_SIZE } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { PosterImage } from './PosterImage';
import {
  EditableOverlay,
  LABEL_PRESETS,
  OverlayContent,
  POSTER_RATIO,
  captionTextStyle,
  fontFamilyFor,
  storyPalette,
  STORY_COLORS,
  STORY_FONTS,
} from './StoryOverlays';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
// The poster sits in the upper area; leaves room for the caption + Share below.
const POSTER_W = Math.min(SCREEN_W * 0.62, (SCREEN_H - 400) / POSTER_RATIO);
const POSTER_H = POSTER_W * POSTER_RATIO;

const uid = () => Math.random().toString(36).slice(2, 10);
const INK = '#2a2018';

const CAPTION_STYLES: { key: CaptionStyle; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'quote', label: 'Quote' },
  { key: 'loud', label: 'Loud' },
];

/** Compose a story: poster + a comment, plus optional decor stickers. */
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
  const [caption, setCaption] = useState('');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('normal');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [decor, setDecor] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [gifsOpen, setGifsOpen] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const gifs = useQuery({
    queryKey: ['giphy', gifQuery],
    queryFn: () => searchGifs(gifQuery),
    enabled: gifsOpen && hasGiphyKey(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (movie) {
      setCaption('');
      setCaptionStyle('normal');
      setStickers([]);
      setDecor(false);
      setSelectedId(null);
      setEditingId(null);
      setPresetsOpen(false);
      setGifsOpen(false);
      setGifQuery('');
    }
  }, [movie]);

  if (!movie) return null;

  const palette = storyPalette(movie.title ?? movie.id);

  const update = (id: string, patch: Partial<TextOverlay> & Partial<EmojiOverlay>) =>
    setStickers((v) => v.map((o) => (o.id === id ? ({ ...o, ...patch } as Sticker) : o)));
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
  const addPreset = (p: (typeof LABEL_PRESETS)[number]) => {
    const o: TextOverlay = {
      id: uid(),
      kind: 'text',
      text: p.text,
      font: p.font,
      color: p.color,
      variant: p.variant,
      bg: p.bg,
      tx: 0,
      ty: -0.18,
      scale: 1,
      rotation: p.rotation,
    };
    setStickers((v) => [...v, o]);
    setSelectedId(o.id);
    setPresetsOpen(false);
  };
  const addGif = (g: GifResult) => {
    const o: GifOverlay = {
      id: uid(),
      kind: 'gif',
      url: g.url,
      aspect: g.aspect,
      tx: 0,
      ty: 0,
      scale: 1,
    };
    setStickers((v) => [...v, o]);
    setSelectedId(o.id);
    setGifsOpen(false);
    Keyboard.dismiss();
  };
  const finishEdit = () => {
    setStickers((v) =>
      v.filter((o) => !(o.id === editingId && o.kind === 'text' && !o.text.trim())),
    );
    setEditingId(null);
  };
  const post = () => {
    const clean = stickers.filter((o) => o.kind !== 'text' || o.text.trim().length > 0);
    const meta: CaptionMeta = { id: 'caption', kind: 'caption', style: captionStyle };
    create.mutate(
      {
        movie: {
          id: movie.id,
          mediaType: movie.mediaType,
          title: movie.title,
          posterPath: movie.posterPath,
          year: movie.year,
        },
        caption: caption.trim(),
        overlays: [meta, ...clean] as Overlay[],
      },
      { onSuccess: onClose },
    );
  };

  const selected = stickers.find((o) => o.id === selectedId) ?? null;
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
        {decor ? (
          <View style={styles.tools}>
            <Pressable onPress={addText} style={styles.tool} hitSlop={6}>
              <Text style={styles.toolAa}>Aa</Text>
            </Pressable>
            <Pressable onPress={() => setPresetsOpen(true)} style={styles.tool} hitSlop={6}>
              <Ionicons name="pricetag-outline" size={20} color={INK} />
            </Pressable>
            <Pressable onPress={() => setGifsOpen(true)} style={styles.tool} hitSlop={6}>
              <Text style={styles.toolGif}>GIF</Text>
            </Pressable>
            {selected && (
              <Pressable onPress={() => remove(selected.id)} style={styles.tool} hitSlop={6}>
                <Ionicons name="trash-outline" size={20} color={INK} />
              </Pressable>
            )}
            <Pressable onPress={() => setDecor(false)} style={styles.doneChip}>
              <Text style={styles.doneChipText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setDecor(true)} style={styles.tool} hitSlop={6}>
            <Ionicons name="sparkles-outline" size={20} color={INK} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={[styles.posterArea, { width: POSTER_W, height: POSTER_H }]}>
            <PosterImage
              posterPath={movie.posterPath}
              title={movie.title}
              size={POSTER_SIZE}
              style={styles.poster}
            />
            {stickers.map((o) => (
              <EditableOverlay
                key={o.id}
                overlay={o}
                canvasW={POSTER_W}
                canvasH={POSTER_H}
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

          <Text style={styles.movieTitle} numberOfLines={2}>
            {movie.title}
            {movie.year != null ? `  ·  ${movie.year}` : ''}
          </Text>
        </ScrollView>

        {!decor && (
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.styleRow}>
              {CAPTION_STYLES.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setCaptionStyle(s.key)}
                  style={[styles.styleChip, captionStyle === s.key && styles.styleChipOn]}
                >
                  <Text
                    style={[styles.styleChipText, captionStyle === s.key && styles.styleChipTextOn]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.input, captionTextStyle(captionStyle, INK, 16)]}
              value={caption}
              onChangeText={setCaption}
              placeholder="(optional)"
              placeholderTextColor="rgba(42,32,24,0.45)"
              multiline
              maxLength={280}
            />
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
        )}
      </KeyboardAvoidingView>

      {presetsOpen && (
        <View style={styles.paletteRoot}>
          <Pressable style={styles.paletteBackdrop} onPress={() => setPresetsOpen(false)} />
          <View style={[styles.presetSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.paletteHandle} />
            <Text style={styles.presetTitle}>Tap a label to add it</Text>
            <ScrollView contentContainerStyle={styles.presetGrid}>
              {LABEL_PRESETS.map((p) => (
                <Pressable key={p.text} onPress={() => addPreset(p)} style={styles.presetCell}>
                  <OverlayContent
                    overlay={{
                      id: 'preview',
                      kind: 'text',
                      text: p.text,
                      font: p.font,
                      color: p.color,
                      variant: p.variant,
                      bg: p.bg,
                      tx: 0,
                      ty: 0,
                      scale: 1,
                    }}
                    canvasW={150}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {gifsOpen && (
        <KeyboardAvoidingView
          style={styles.paletteRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.paletteBackdrop}
            onPress={() => {
              setGifsOpen(false);
              Keyboard.dismiss();
            }}
          />
          <View style={[styles.gifSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.paletteHandle} />
            {hasGiphyKey() ? (
              <>
                <TextInput
                  style={styles.gifSearch}
                  value={gifQuery}
                  onChangeText={setGifQuery}
                  placeholder="Search GIFs…"
                  placeholderTextColor={chrome.muted}
                  autoFocus
                  returnKeyType="search"
                />
                {gifs.isLoading ? (
                  <ActivityIndicator color={chrome.accent} style={styles.gifLoading} />
                ) : (
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.gifGrid}
                  >
                    {(gifs.data ?? []).map((g) => (
                      <Pressable key={g.id} onPress={() => addGif(g)} style={styles.gifCell}>
                        <Image
                          source={{ uri: g.previewUrl }}
                          style={styles.gifImg}
                          contentFit="cover"
                        />
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </>
            ) : (
              <Text style={styles.gifHint}>
                Add EXPO_PUBLIC_GIPHY_API_KEY to your .env to enable GIF stickers.
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      )}

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
              maxLength={120}
              style={[
                styles.editInput,
                { fontFamily: fontFamilyFor(editing.font), color: editing.color },
              ]}
            />
          </View>
          <View style={[styles.editBar, { paddingBottom: insets.bottom + spacing.sm }]}>
            <View style={styles.variantRow}>
              {(['plain', 'pill', 'stamp'] as TextVariant[]).map((vr) => (
                <Pressable
                  key={vr}
                  onPress={() =>
                    update(editing.id, {
                      variant: vr,
                      ...(vr === 'pill' && !editing.bg ? { bg: '#c1443b' } : {}),
                    })
                  }
                  style={[
                    styles.vChip,
                    (editing.variant ?? 'plain') === vr && styles.vChipOn,
                  ]}
                >
                  <Text style={styles.vChipText}>
                    {vr === 'plain' ? 'Plain' : vr === 'pill' ? 'Pill' : 'Stamp'}
                  </Text>
                </Pressable>
              ))}
            </View>
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
    tools: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    tool: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.07)',
    },
    toolAa: { color: INK, fontFamily: fonts.display, fontSize: 17 },
    doneChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      backgroundColor: c.accent,
    },
    doneChipText: {
      color: c.onAccent,
      fontFamily: fonts.label,
      fontSize: 13,
      textTransform: 'uppercase',
    },
    kav: { flex: 1 },
    scrollFlex: { flex: 1 },
    scroll: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.lg },
    posterArea: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    poster: { width: '100%', height: '100%' },
    movieTitle: {
      color: INK,
      fontFamily: fonts.display,
      fontSize: 20,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    styleRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    styleChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.22)',
    },
    styleChipOn: { backgroundColor: INK, borderColor: INK },
    styleChipText: {
      color: INK,
      fontFamily: fonts.label,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    styleChipTextOn: { color: '#f3ece0' },
    input: {
      alignSelf: 'stretch',
      minHeight: 52,
      maxHeight: 120,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.18)',
      borderRadius: radius.md,
      backgroundColor: 'rgba(255,255,255,0.5)',
      padding: spacing.md,
      textAlignVertical: 'top',
    },
    bottomBar: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.08)',
    },
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
      color: 'rgba(42,32,24,0.55)',
      fontFamily: fonts.body,
      fontSize: 14,
      textAlign: 'center',
    },
    paletteRoot: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
    paletteBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    paletteHandle: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    presetSheet: {
      maxHeight: '60%',
      backgroundColor: c.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 2,
      borderColor: c.border,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    presetTitle: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    presetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    presetCell: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    variantRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    vChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    vChipOn: { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: '#fff' },
    vChipText: {
      color: '#fff',
      fontFamily: fonts.label,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    toolGif: { color: INK, fontFamily: fonts.label, fontSize: 12, letterSpacing: 0.5 },
    gifSheet: {
      maxHeight: '70%',
      backgroundColor: c.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 2,
      borderColor: c.border,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    gifSearch: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.surfaceRaised,
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 17,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
    },
    gifLoading: { marginVertical: spacing.xl },
    gifGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingBottom: spacing.sm,
    },
    gifCell: {
      width: '31.5%',
      aspectRatio: 1,
      borderRadius: radius.sm,
      overflow: 'hidden',
      backgroundColor: c.surfaceRaised,
    },
    gifImg: { width: '100%', height: '100%' },
    gifHint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 16,
      textAlign: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
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
    editInput: { minWidth: 80, fontSize: 30, textAlign: 'center' },
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
    fontChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    fontChipOn: { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: '#fff' },
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
