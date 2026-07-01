import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { fetchMediaById } from '@/api/movies';
import { MediaType } from '@/api/types';
import { getDatabase } from '@/db/database';
import { LandingScreen } from '@/components/LandingScreen';
import {
  MovieDetailsProvider,
  useMovieDetails,
} from '@/components/MovieDetailsProvider';
import {
  MediaTypeProvider,
  useMediaTypeControls,
} from '@/context/MediaTypeProvider';
import { ProfileProvider } from '@/context/ProfileProvider';
import { colors, fontMap } from '@/theme';

// Keep the splash screen up until fonts are ready (avoids a flash of system font).
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontMap);

  // Initialise SQLite once on startup (creates tables if they don't exist).
  useEffect(() => {
    getDatabase().catch((err) => console.warn('Database init failed', err));
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ProfileProvider>
            <MediaTypeProvider>
              <StatusBar style="light" />
              <MovieDetailsProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                </Stack>
                <DeeplinkHandler />
              </MovieDetailsProvider>
              <LandingGate />
            </MediaTypeProvider>
          </ProfileProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Shows the category picker until the user enters a shelf. */
function LandingGate() {
  const { chosen } = useMediaTypeControls();
  if (chosen) return null;
  return <LandingScreen />;
}

/**
 * Listens for incoming `shelfed://open?type=...&id=...` deeplinks (e.g. when a
 * friend taps a shared title). Fetches the title, enters the matching shelf,
 * and opens the details modal so the recipient can immediately add or save it.
 */
function DeeplinkHandler() {
  const url = Linking.useURL();
  const { open } = useMovieDetails();
  const { choose, chosen } = useMediaTypeControls();

  useEffect(() => {
    if (!url) return;
    const parsed = Linking.parse(url);
    if (parsed.hostname !== 'open') return;
    const type = parsed.queryParams?.type;
    const id = parsed.queryParams?.id;
    if (typeof type !== 'string' || typeof id !== 'string') return;
    if (type !== 'movie' && type !== 'tv' && type !== 'book') return;

    let cancelled = false;
    fetchMediaById(type as MediaType, id)
      .then((movie) => {
        if (cancelled || !movie) return;
        if (!chosen) choose(movie.mediaType);
        open(movie);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url, open, choose, chosen]);

  return null;
}

const styles = { root: { flex: 1, backgroundColor: colors.background } } as const;
