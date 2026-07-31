import { StreakSnapshot } from '../types';
import { localDateKey } from '../utils/time';

export function computeStreak(
  streakDays: Record<string, boolean>,
  today = localDateKey(),
): StreakSnapshot {
  const last7DaysMet: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7DaysMet.push(!!streakDays[localDateKey(d.getTime())]);
  }

  let currentStreak = 0;
  const cursor = new Date();
  while (true) {
    const key = localDateKey(cursor.getTime());
    if (streakDays[key]) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (key === today) {
      // Today not marked yet — don't break streak
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak, last7DaysMet };
}
