import milestones from '../data/milestones.json';
import { ActiveFast, FastState, Milestone } from '../types';

export function getFastState(active: ActiveFast | null, now = Date.now()): FastState | null {
  if (!active?.isActive) return null;

  const totalMs = active.targetEndAt - active.startedAt;
  const elapsedMs = now - active.startedAt;
  const remainingMs = Math.max(0, active.targetEndAt - now);
  const progress = totalMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0;

  return {
    remainingMs,
    elapsedMs,
    totalMs,
    progress,
    isComplete: remainingMs <= 0,
    elapsedHours: Math.max(0, elapsedMs / (1000 * 60 * 60)),
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getMilestone(elapsedHours: number): Milestone {
  const match = (milestones as Milestone[]).find(
    (m) => elapsedHours >= m.hourStart && elapsedHours < m.hourEnd,
  );
  return match ?? (milestones as Milestone[])[(milestones as Milestone[]).length - 1];
}

export function localDateKey(ts = Date.now()): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
