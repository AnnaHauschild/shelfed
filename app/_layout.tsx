import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { getDatabase } from '@/db/database';
import { LandingScreen } from '@/components/LandingScreen';
import { MovieDetailsProvider } from '@/components/MovieDetailsProvider';
import {
  MediaTypeProvider,
  useMediaTypeControls,
} from '@/context/MediaTypeProvider';
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
            </MovieDetailsProvider>
            <LandingGate />
          </MediaTypeProvider>
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

const styles = { root: { flex: 1, backgroundColor: colors.background } } as const;
