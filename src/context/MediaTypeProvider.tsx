import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { MediaType } from '@/api/types';

interface MediaTypeContextValue {
  /** The currently active category (defaults to 'movie'). */
  mediaType: MediaType;
  /** Whether the user has picked a category on the landing screen yet. */
  chosen: boolean;
  /** Pick a category from the landing screen (enters the app). */
  choose: (mt: MediaType) => void;
  /** Switch category while inside the app (the top switcher). */
  setMediaType: (mt: MediaType) => void;
  /** Return to the landing screen to pick again. */
  backToLanding: () => void;
}

const MediaTypeContext = createContext<MediaTypeContextValue | null>(null);

/**
 * Holds the app-wide media-type selection. A landing screen sets the initial
 * category; an in-app switcher changes it. Kept in memory so the landing screen
 * shows on every launch (the user explicitly picks a shelf each time).
 */
export function MediaTypeProvider({ children }: { children: React.ReactNode }) {
  const [mediaType, setMediaTypeState] = useState<MediaType>('movie');
  const [chosen, setChosen] = useState(false);

  const choose = useCallback((mt: MediaType) => {
    setMediaTypeState(mt);
    setChosen(true);
  }, []);

  const setMediaType = useCallback((mt: MediaType) => {
    setMediaTypeState(mt);
  }, []);

  const backToLanding = useCallback(() => setChosen(false), []);

  const value = useMemo(
    () => ({ mediaType, chosen, choose, setMediaType, backToLanding }),
    [mediaType, chosen, choose, setMediaType, backToLanding],
  );

  return (
    <MediaTypeContext.Provider value={value}>
      {children}
    </MediaTypeContext.Provider>
  );
}

function useMediaTypeContext(): MediaTypeContextValue {
  const ctx = useContext(MediaTypeContext);
  if (!ctx) {
    throw new Error('useMediaType must be used within a MediaTypeProvider');
  }
  return ctx;
}

/** The currently selected media type ('movie' | 'tv'). */
export function useMediaType(): MediaType {
  return useMediaTypeContext().mediaType;
}

/** Full controls for the landing gate and the in-app switcher. */
export function useMediaTypeControls(): MediaTypeContextValue {
  return useMediaTypeContext();
}
