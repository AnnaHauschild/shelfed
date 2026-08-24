import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MediaType } from '@/api/types';
import { useMediaType } from '@/context/MediaTypeProvider';
import { useThemeChrome } from '@/context/ThemeProvider';
import { fonts } from '@/theme';
import { WATCHLIST_LABEL } from '@/constants/labels';

// Discover tab icon follows the active category (film / series / book / game).
const DISCOVER_ICONS: Record<
  MediaType,
  { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }
> = {
  movie: { on: 'film', off: 'film-outline' },
  tv: { on: 'tv', off: 'tv-outline' },
  book: { on: 'book', off: 'book-outline' },
  game: { on: 'game-controller', off: 'game-controller-outline' },
};

/** Discover tab icon that reflects the currently selected category. */
function DiscoverTabIcon({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) {
  const mediaType = useMediaType();
  const icon = DISCOVER_ICONS[mediaType];
  return (
    <Ionicons name={focused ? icon.on : icon.off} color={color} size={size} />
  );
}

/** Bottom tab navigation across the four main screens. */
export default function TabsLayout() {
  const chrome = useThemeChrome();
  const insets = useSafeAreaInsets();
  // Under edge-to-edge Android draws behind the system nav bar, and some devices
  // under-report the bottom inset, so lift the tab bar clear of it (Android only).
  const isAndroid = Platform.OS === 'android';
  const androidBottom = isAndroid ? Math.max(insets.bottom, 12) : 0;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: chrome.accent,
        tabBarInactiveTintColor: chrome.muted,
        tabBarStyle: {
          backgroundColor: chrome.surface,
          borderTopColor: chrome.border,
          borderTopWidth: 1,
          ...(isAndroid
            ? {
                height: 60 + androidBottom,
                paddingBottom: androidBottom + 6,
                paddingTop: 8,
              }
            : null),
        },
        tabBarLabelStyle: {
          fontFamily: fonts.label,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: (props) => <DiscoverTabIcon {...props} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shelf"
        options={{
          title: 'Shelf',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'albums' : 'albums-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: WATCHLIST_LABEL,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'star' : 'star-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
