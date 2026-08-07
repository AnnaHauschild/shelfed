import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { SettingsSheet } from '@/components/SettingsSheet';

interface SettingsValue {
  /** Opens the settings sheet; pass { stats: true } to land on Statistics. */
  open: (opts?: { stats?: boolean }) => void;
}

const SettingsContext = createContext<SettingsValue>({ open: () => {} });

export function useSettings(): SettingsValue {
  return useContext(SettingsContext);
}

/** Hosts the app-wide settings sheet so it can be opened from anywhere. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [scrollTo, setScrollTo] = useState<'stats' | null>(null);

  const open = useCallback((opts?: { stats?: boolean }) => {
    setScrollTo(opts?.stats ? 'stats' : null);
    setVisible(true);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
      <SettingsSheet
        visible={visible}
        scrollTo={scrollTo}
        onClose={() => setVisible(false)}
      />
    </SettingsContext.Provider>
  );
}
