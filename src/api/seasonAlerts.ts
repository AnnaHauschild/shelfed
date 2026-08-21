import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSetting, setSetting } from '@/db/settings';
import { interactionRepository } from '@/repositories';
import { contentLanguage, tmdbGet } from './tmdb';

const ENABLED_KEY = 'newSeasonAlerts';
const SCHEDULED_KEY = 'seasonAlertScheduled'; // JSON string[] of "tvId:season"
const CHANNEL_ID = 'season-alerts';

interface TvNextEpisode {
  name?: string;
  next_episode_to_air?: {
    air_date?: string | null;
    season_number?: number | null;
    episode_number?: number | null;
  } | null;
}

export async function seasonAlertsEnabled(): Promise<boolean> {
  return (await getSetting(ENABLED_KEY)) === '1';
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  const status =
    current.status === 'granted'
      ? current.status
      : (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'New-season alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

/** Enable/disable the feature; returns the effective state (false if denied). */
export async function setSeasonAlertsEnabled(next: boolean): Promise<boolean> {
  if (!next) {
    await setSetting(ENABLED_KEY, '0');
    await Notifications.cancelAllScheduledNotificationsAsync();
    await setSetting(SCHEDULED_KEY, '[]');
    return false;
  }
  if (!(await ensurePermission())) return false;
  await setSetting(ENABLED_KEY, '1');
  await syncSeasonAlerts();
  return true;
}

/**
 * Schedule a local reminder for each Watchlist/Favorite series whose next aired
 * episode is a season premiere (episode 1). Best-effort, deduped, no backend —
 * runs whenever the app is opened, so it only catches premieres announced before
 * they air while the app is used at least once in between.
 */
export async function syncSeasonAlerts(): Promise<void> {
  if (!(await seasonAlertsEnabled())) return;
  const items = await interactionRepository.getSyncItems();
  const series = new Map<string, string>();
  for (const i of items) {
    if (
      i.mediaType === 'tv' &&
      (i.type === 'watchlist' || i.type === 'favorite')
    ) {
      series.set(i.movieId, i.title);
    }
  }
  if (series.size === 0) return;

  const scheduled = new Set(parseKeys(await getSetting(SCHEDULED_KEY)));
  const language = contentLanguage();

  for (const [id, title] of series) {
    try {
      const data = await tmdbGet<TvNextEpisode>(`/tv/${id}`, { language });
      const next = data.next_episode_to_air;
      if (
        !next?.air_date ||
        next.episode_number !== 1 ||
        next.season_number == null
      ) {
        continue;
      }
      const key = `${id}:${next.season_number}`;
      if (scheduled.has(key)) continue;
      const when = new Date(`${next.air_date}T09:00:00`);
      if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New season out',
          body: `Season ${next.season_number} of ${data.name || title} just started.`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: CHANNEL_ID,
        },
      });
      scheduled.add(key);
    } catch {
      // best-effort; skip this series
    }
  }
  await setSetting(SCHEDULED_KEY, JSON.stringify([...scheduled]));
}

function parseKeys(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
