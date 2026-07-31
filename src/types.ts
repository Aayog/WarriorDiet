export interface ActiveFast {
  isActive: boolean;
  protocolId: string;
  startedAt: number;
  targetEndAt: number;
}

export interface FastSession {
  id: string;
  protocolId: string;
  startedAt: number;
  endedAt: number;
  wasGoalMet: boolean;
}

export interface Protocol {
  id: string;
  name: string;
  hours: number;
}

export interface Milestone {
  hourStart: number;
  hourEnd: number;
  phase: string;
  desc: string;
}

export interface AppSettings {
  goalHours: number;
  defaultProtocolId: string;
  notificationsEnabled: boolean;
}

export interface StreakSnapshot {
  currentStreak: number;
  last7DaysMet: boolean[];
}

export interface FastState {
  remainingMs: number;
  elapsedMs: number;
  totalMs: number;
  progress: number;
  isComplete: boolean;
  elapsedHours: number;
}
