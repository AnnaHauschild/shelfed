import { useEffect } from 'react';
import { syncSeasonAlerts } from '@/api/seasonAlerts';

/**
 * Refreshes scheduled new-season reminders on app start. No-op unless the user
 * opted in; best-effort so it never blocks the app. Mounted once at the root.
 */
export function SeasonAlertGate() {
  useEffect(() => {
    syncSeasonAlerts().catch(() => {});
  }, []);
  return null;
}
