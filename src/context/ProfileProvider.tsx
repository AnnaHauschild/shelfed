import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getSetting, setSetting } from '@/db/settings';

const KEY = 'profile.name';

interface ProfileContextValue {
  /** The user's display name (used in share messages), or null if unset. */
  name: string | null;
  /** Whether the initial load from SQLite has finished. */
  ready: boolean;
  /** Persists a new name (trimmed). Empty string clears it. */
  setName: (next: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Loads the locally stored display name once and exposes a setter. */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [name, setNameState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSetting(KEY)
      .then((v) => {
        if (cancelled) return;
        setNameState(v && v.length > 0 ? v : null);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setName = useCallback(async (next: string) => {
    const trimmed = next.trim().slice(0, 40);
    await setSetting(KEY, trimmed);
    setNameState(trimmed.length > 0 ? trimmed : null);
  }, []);

  const value = useMemo(() => ({ name, ready, setName }), [name, ready, setName]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
