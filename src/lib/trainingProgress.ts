export type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

export function rangeToDate(from: Date, range: TimeRange): Date | null {
  if (range === 'all') return null;
  const d = new Date(from);
  const map: Record<Exclude<TimeRange, 'all'>, number> = {
    '1w': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
  };
  d.setDate(d.getDate() - map[range]);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Brzycki / Epley-style estimate when reps known; else max load */
export function estimateE1rm(weightKg: number, reps?: number | null): number {
  if (!weightKg || weightKg <= 0) return 0;
  if (reps && reps > 0) {
    return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
  }
  return Math.round(weightKg * 10) / 10;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekKey(date: Date): string {
  return startOfWeek(date).toISOString().slice(0, 10);
}
