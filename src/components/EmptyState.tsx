import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

/** Centered placeholder shown when a screen has no content yet. */
export function EmptyState({ icon, title, message }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.border} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  title: {
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  message: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
