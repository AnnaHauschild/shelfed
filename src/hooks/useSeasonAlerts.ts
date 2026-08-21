import { useCallback, useEffect, useState } from 'react';
import { seasonAlertsEnabled, setSeasonAlertsEnabled } from '@/api/seasonAlerts';

/** Opt-in state + toggle for new-season notifications (persisted in SQLite). */
export function useSeasonAlerts() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    seasonAlertsEnabled().then(setEnabled);
  }, []);

  const toggle = useCallback(async (next: boolean) => {
    setBusy(true);
    try {
      setEnabled(await setSeasonAlertsEnabled(next));
    } finally {
      setBusy(false);
    }
  }, []);

  return { enabled, busy, toggle };
}
