import { eachDateKey, parseDateKey, toDateKey } from '@/lib/foodTracking';

export const MAX_ACTIVE_LIFESTYLE_HABITS = 3;

export const LIFESTYLE_HABIT_CATEGORIES = [
  'nutrition',
  'mindset',
  'movement',
  'sleep',
] as const;

export type LifestyleHabitCategory = (typeof LIFESTYLE_HABIT_CATEGORIES)[number];

export const LIFESTYLE_HABIT_KEYS = [
  'replace-soda',
  'healthy-snack',
  'protein-meals',
  'mindful-eating',
  'daily-walk',
  'morning-movement',
  'sleep-routine',
  'gratitude',
  'screen-free-morning',
  'meal-prep-plan',
] as const;

export type LifestyleHabitKey = (typeof LIFESTYLE_HABIT_KEYS)[number];

export type LifestyleHabitDef = {
  key: LifestyleHabitKey;
  category: LifestyleHabitCategory;
};

export const LIFESTYLE_HABITS: LifestyleHabitDef[] = [
  { key: 'replace-soda', category: 'nutrition' },
  { key: 'healthy-snack', category: 'nutrition' },
  { key: 'protein-meals', category: 'nutrition' },
  { key: 'mindful-eating', category: 'nutrition' },
  { key: 'meal-prep-plan', category: 'nutrition' },
  { key: 'gratitude', category: 'mindset' },
  { key: 'screen-free-morning', category: 'mindset' },
  { key: 'daily-walk', category: 'movement' },
  { key: 'morning-movement', category: 'movement' },
  { key: 'sleep-routine', category: 'sleep' },
];

export function isLifestyleHabitKey(key: string): key is LifestyleHabitKey {
  return (LIFESTYLE_HABIT_KEYS as readonly string[]).includes(key);
}

export function getHabitDef(key: string): LifestyleHabitDef | undefined {
  return LIFESTYLE_HABITS.find((h) => h.key === key);
}

/** Current streak: consecutive days ending today/yesterday with completed=true */
export function computeHabitStreak(
  completedDates: Set<string>,
  fromDate = new Date(),
): number {
  let streak = 0;
  const d = new Date(fromDate);
  d.setHours(0, 0, 0, 0);

  // Allow starting from yesterday if today not done yet
  const todayKey = toDateKey(d);
  if (!completedDates.has(todayKey)) {
    d.setDate(d.getDate() - 1);
  }

  while (completedDates.has(toDateKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export type DayHabitSummary = {
  date: string;
  completed: number;
  total: number;
  rate: number;
};

export function summarizeHabitDays(
  activeKeys: string[],
  logs: Array<{ habitKey: string; date: Date; completed: boolean }>,
  days = 7,
): DayHabitSummary[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));

  const keys = eachDateKey(from, today);
  const byDate = new Map<string, Set<string>>();

  for (const log of logs) {
    if (!log.completed || !activeKeys.includes(log.habitKey)) continue;
    const dk = toDateKey(log.date);
    if (!byDate.has(dk)) byDate.set(dk, new Set());
    byDate.get(dk)!.add(log.habitKey);
  }

  return keys.map((date) => {
    const done = byDate.get(date)?.size ?? 0;
    const total = activeKeys.length;
    return {
      date,
      completed: done,
      total,
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });
}

export function parseHabitDateKey(key: string): Date {
  return parseDateKey(key);
}
