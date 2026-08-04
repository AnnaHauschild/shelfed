import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getSetting, setSetting } from '@/db/settings';

/** Persisted key for the chosen shelf background theme. */
export const SHELF_THEME_KEY = 'shelfTheme';

/** The available shelf background looks. */
export type ShelfTheme = 'classic' | 'scifi' | 'minimal';

interface ThemeContextValue {
  /** The active shelf background theme (defaults to 'classic'). */
  theme: ShelfTheme;
  /** Persists a new theme choice. */
  setTheme: (t: ShelfTheme) => void;
  /** Whether the initial load from SQLite has finished. */
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Holds the user's chosen shelf background theme. Persisted in SQLite so the
 * choice survives restarts. Read by ShelfBackground (to render the look) and by
 * the settings sheet (to pick it).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ShelfTheme>('classic');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSetting(SHELF_THEME_KEY)
      .then((v) => {
        if (cancelled) return;
        if (v === 'classic' || v === 'scifi' || v === 'minimal') {
          setThemeState(v);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback(async (t: ShelfTheme) => {
    setThemeState(t);
    await setSetting(SHELF_THEME_KEY, t);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, ready }),
    [theme, setTheme, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

/** Theme-aware colours for the neutral app chrome (tab bar, media switcher,
 *  control pills). Classic = warm brown/gold; sci-fi = dark blue/neon;
 *  minimal = grey/white. Per-shelf accent colours stay as list identity. */
export interface ThemeChrome {
  accent: string;
  onAccent: string;
  surface: string;
  border: string;
  muted: string;
}

const CHROME: Record<ShelfTheme, ThemeChrome> = {
  classic: {
    accent: '#e0a23c',
    onAccent: '#1d140c',
    surface: '#2b1d12',
    border: '#5a4128',
    muted: '#b89b73',
  },
  scifi: {
    accent: '#5fe0ff',
    onAccent: '#07101f',
    surface: '#101d33',
    border: '#284a76',
    muted: '#8fa6c4',
  },
  minimal: {
    accent: '#eaeaec',
    onAccent: '#1f1f22',
    surface: '#35353a',
    border: '#5a5a61',
    muted: '#a8a8ad',
  },
};

/** Chrome colours for the currently selected theme. */
export function useThemeChrome(): ThemeChrome {
  return CHROME[useTheme().theme];
}
