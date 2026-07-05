import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setContentLanguage } from '@/api/tmdb';
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_SETTING_KEY,
  UI_TEXT,
  UiText,
  isAppLanguage,
  tmdbTag,
} from '@/constants/languages';
import { getSetting, setSetting } from '@/db/settings';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (code: AppLanguage) => void;
  /** Localized UI strings for the chosen language. */
  text: UiText;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Holds the user's content language. Drives TMDB's `language` param (localized
 * titles + descriptions) and a few localized UI hints. Persisted in SQLite so
 * the choice survives restarts.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);

  // Keep the API layer in sync with the selected language BEFORE children run
  // their queries, so the feed fetches in the right language immediately. This
  // is an idempotent assignment of a module variable (safe during render).
  setContentLanguage(tmdbTag(language));

  // Load the persisted choice once on startup.
  useEffect(() => {
    let alive = true;
    getSetting(LANGUAGE_SETTING_KEY).then((value) => {
      if (alive && isAppLanguage(value)) setLanguageState(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setLanguage = useCallback((code: AppLanguage) => {
    setLanguageState(code);
    setContentLanguage(tmdbTag(code));
    setSetting(LANGUAGE_SETTING_KEY, code).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, text: UI_TEXT[language] }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/** The selected language, its setter, and localized UI strings. */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
