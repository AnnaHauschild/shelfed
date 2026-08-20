import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeChrome } from '@/context/ThemeProvider';
import { colors, fonts, radius, spacing } from '@/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * About / credits modal. Required for TMDB API attribution and a good place
 * for Open Library credit + future privacy policy link.
 */
export function AboutModal({ visible, onClose }: Props) {
  const chrome = useThemeChrome();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: chrome.background, borderColor: chrome.border }]}>
        <View style={[styles.header, { borderBottomColor: chrome.border }]}>
          <Text style={styles.title}>About Shelfed</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={20} color={colors.textOnDarkMuted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.tagline, { color: chrome.accent }]}>
            Your personal shelf for movies, series, books and games.
          </Text>

          <Section label="Movies & Series">
            <Text style={styles.body}>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </Text>
            <Pressable onPress={() => Linking.openURL('https://www.themoviedb.org/').catch(() => {})}>
              <Text style={[styles.link, { color: chrome.accent }]}>themoviedb.org</Text>
            </Pressable>
          </Section>

          <Section label="Books">
            <Text style={styles.body}>
              Book data and covers provided by Google Books.
            </Text>
            <Pressable onPress={() => Linking.openURL('https://books.google.com/').catch(() => {})}>
              <Text style={[styles.link, { color: chrome.accent }]}>books.google.com</Text>
            </Pressable>
          </Section>

          <Section label="Games">
            <Text style={styles.body}>
              Game data and images provided by RAWG, the largest video game database.
            </Text>
            <Pressable onPress={() => Linking.openURL('https://rawg.io/').catch(() => {})}>
              <Text style={[styles.link, { color: chrome.accent }]}>rawg.io</Text>
            </Pressable>
          </Section>

          <Section label="Privacy">
            <Text style={styles.body}>
              Shelfed stores all your shelves, watchlists and your name on your device only.
              Nothing is sent to a Shelfed server — there isn't one.
            </Text>
          </Section>

          <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const chrome = useThemeChrome();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: chrome.accent }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '12%',
    bottom: '12%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  tagline: {
    color: colors.amber,
    fontFamily: fonts.body,
    fontSize: 15,
    fontStyle: 'italic',
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.amber,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.amberBright,
    fontFamily: fonts.body,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  version: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
  },
});
