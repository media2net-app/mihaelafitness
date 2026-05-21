export type TrainingDaySlot = { weekday: number; trainingDay: number };

/** Mon=1 … Sun=7 */
export function slotsFromWeekdays(weekdays: number[]): TrainingDaySlot[] {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map((weekday, i) => ({ weekday, trainingDay: i + 1 }));
}

export function weekdaysFromSlots(slots: TrainingDaySlot[]): number[] {
  return slots.map((s) => s.weekday).sort((a, b) => a - b);
}

export function requiredTrainingDayCount(
  slots: TrainingDaySlot[],
  fallback = 3,
): number {
  if (slots.length === 0) return fallback;
  const unique = new Set(slots.map((s) => s.trainingDay));
  return unique.size;
}

export function toggleWeekdaySelection(
  selected: number[],
  weekday: number,
  max: number,
): number[] {
  if (selected.includes(weekday)) {
    return selected.filter((w) => w !== weekday);
  }
  if (selected.length >= max) return selected;
  return [...selected, weekday].sort((a, b) => a - b);
}
