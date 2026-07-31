import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveFast, AppSettings, FastSession } from '../types';

const KEYS = {
  ACTIVE_FAST: 'wd_active_fast',
  HISTORY: 'wd_history',
  STREAK_DAYS: 'wd_streak_days',
  SETTINGS: 'wd_settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  goalHours: 20,
  defaultProtocolId: '20_4',
  notificationsEnabled: true,
};

export async function loadActiveFast(): Promise<ActiveFast | null> {
  const raw = await AsyncStorage.getItem(KEYS.ACTIVE_FAST);
  if (!raw) return null;
  return JSON.parse(raw) as ActiveFast;
}

export async function saveActiveFast(fast: ActiveFast | null): Promise<void> {
  if (!fast) {
    await AsyncStorage.removeItem(KEYS.ACTIVE_FAST);
    return;
  }
  await AsyncStorage.setItem(KEYS.ACTIVE_FAST, JSON.stringify(fast));
}

export async function loadHistory(): Promise<FastSession[]> {
  const raw = await AsyncStorage.getItem(KEYS.HISTORY);
  if (!raw) return [];
  return JSON.parse(raw) as FastSession[];
}

export async function appendHistory(session: FastSession): Promise<void> {
  const history = await loadHistory();
  history.unshift(session);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
}

export async function loadStreakDays(): Promise<Record<string, boolean>> {
  const raw = await AsyncStorage.getItem(KEYS.STREAK_DAYS);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, boolean>;
}

export async function saveStreakDays(days: Record<string, boolean>): Promise<void> {
  await AsyncStorage.setItem(KEYS.STREAK_DAYS, JSON.stringify(days));
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as AppSettings) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}
