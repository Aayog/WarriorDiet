import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getProtocol } from '../data/protocols';
import {
  appendHistory,
  loadActiveFast,
  loadHistory,
  loadSettings,
  loadStreakDays,
  saveActiveFast,
  saveSettings,
  saveStreakDays,
} from '../db/storage';
import { clearNotifications, ensureNotificationPermissions, rescheduleNotifications } from '../engines/notifications';
import { computeStreak } from '../engines/streak';
import { ActiveFast, AppSettings, FastSession, StreakSnapshot } from '../types';
import { getFastState, localDateKey } from '../utils/time';

interface FastContextValue {
  loading: boolean;
  activeFast: ActiveFast | null;
  history: FastSession[];
  settings: AppSettings;
  streak: StreakSnapshot;
  tick: number;
  startFast: (protocolId?: string, startedAt?: number) => Promise<void>;
  endFast: () => Promise<void>;
  adjustEndByMinutes: (delta: number) => Promise<void>;
  setStartedAt: (ts: number) => Promise<void>;
  setTargetEndAt: (ts: number) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

const FastContext = createContext<FastContextValue | null>(null);

async function persistActiveFast(fast: ActiveFast | null, notificationsEnabled: boolean) {
  await saveActiveFast(fast);
  if (!fast?.isActive || !notificationsEnabled) {
    await clearNotifications();
    return;
  }
  await rescheduleNotifications(fast.targetEndAt);
}

export function FastProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [activeFast, setActiveFast] = useState<ActiveFast | null>(null);
  const [history, setHistory] = useState<FastSession[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    goalHours: 20,
    defaultProtocolId: '20_4',
    notificationsEnabled: true,
  });
  const [streakDays, setStreakDays] = useState<Record<string, boolean>>({});
  const [tick, setTick] = useState(Date.now());

  const streak = useMemo(() => computeStreak(streakDays), [streakDays]);

  const refresh = useCallback(async () => {
    const [fast, hist, s, days] = await Promise.all([
      loadActiveFast(),
      loadHistory(),
      loadSettings(),
      loadStreakDays(),
    ]);
    setActiveFast(fast);
    setHistory(hist);
    setSettings(s);
    setStreakDays(days);
  }, []);

  useEffect(() => {
    (async () => {
      await ensureNotificationPermissions();
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const updateActive = useCallback(
    async (next: ActiveFast | null) => {
      setActiveFast(next);
      await persistActiveFast(next, settings.notificationsEnabled);
    },
    [settings.notificationsEnabled],
  );

  const startFast = useCallback(
    async (protocolId?: string, startedAt?: number) => {
      const pid = protocolId ?? settings.defaultProtocolId;
      const protocol = getProtocol(pid);
      const start = startedAt ?? Date.now();
      const next: ActiveFast = {
        isActive: true,
        protocolId: pid,
        startedAt: start,
        targetEndAt: start + protocol.hours * 60 * 60 * 1000,
      };
      await updateActive(next);
    },
    [settings.defaultProtocolId, updateActive],
  );

  const endFast = useCallback(async () => {
    if (!activeFast?.isActive) return;

    const endedAt = Date.now();
    const durationMs = endedAt - activeFast.startedAt;
    const wasGoalMet = durationMs >= settings.goalHours * 60 * 60 * 1000;

    const session: FastSession = {
      id: `${activeFast.startedAt}`,
      protocolId: activeFast.protocolId,
      startedAt: activeFast.startedAt,
      endedAt,
      wasGoalMet,
    };

    await appendHistory(session);

    if (wasGoalMet) {
      const days = await loadStreakDays();
      days[localDateKey(endedAt)] = true;
      await saveStreakDays(days);
      setStreakDays(days);
    }

    await updateActive(null);
    setHistory(await loadHistory());
  }, [activeFast, settings.goalHours, updateActive]);

  const adjustEndByMinutes = useCallback(
    async (delta: number) => {
      if (!activeFast?.isActive) return;
      const next: ActiveFast = {
        ...activeFast,
        targetEndAt: activeFast.targetEndAt + delta * 60 * 1000,
      };
      await updateActive(next);
    },
    [activeFast, updateActive],
  );

  const setStartedAt = useCallback(
    async (ts: number) => {
      if (!activeFast?.isActive) return;
      const duration = activeFast.targetEndAt - activeFast.startedAt;
      const next: ActiveFast = {
        ...activeFast,
        startedAt: ts,
        targetEndAt: ts + duration,
      };
      await updateActive(next);
    },
    [activeFast, updateActive],
  );

  const setTargetEndAt = useCallback(
    async (ts: number) => {
      if (!activeFast?.isActive) return;
      const next: ActiveFast = { ...activeFast, targetEndAt: ts };
      await updateActive(next);
    },
    [activeFast, updateActive],
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await saveSettings(next);
      if (activeFast?.isActive) {
        await persistActiveFast(activeFast, next.notificationsEnabled);
      } else if (!next.notificationsEnabled) {
        await clearNotifications();
      }
    },
    [activeFast, settings],
  );

  const value = useMemo(
    () => ({
      loading,
      activeFast,
      history,
      settings,
      streak,
      tick,
      startFast,
      endFast,
      adjustEndByMinutes,
      setStartedAt,
      setTargetEndAt,
      updateSettings,
      refresh,
    }),
    [
      loading,
      activeFast,
      history,
      settings,
      streak,
      tick,
      startFast,
      endFast,
      adjustEndByMinutes,
      setStartedAt,
      setTargetEndAt,
      updateSettings,
      refresh,
    ],
  );

  return <FastContext.Provider value={value}>{children}</FastContext.Provider>;
}

export function useFast() {
  const ctx = useContext(FastContext);
  if (!ctx) throw new Error('useFast must be used within FastProvider');
  return ctx;
}

export function useFastState() {
  const { activeFast, tick } = useFast();
  return useMemo(() => getFastState(activeFast, tick), [activeFast, tick]);
}
