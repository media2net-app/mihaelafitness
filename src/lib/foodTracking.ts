export const FOOD_MEALS_PER_DAY = 6;

export const FOOD_MEAL_SLOTS = [
  { slot: 1, key: 'breakfast', labelEn: 'Breakfast', labelRo: 'Mic dejun' },
  { slot: 2, key: 'morning-snack', labelEn: 'Morning snack', labelRo: 'Gustare dimineață' },
  { slot: 3, key: 'lunch', labelEn: 'Lunch', labelRo: 'Prânz' },
  { slot: 4, key: 'afternoon-snack', labelEn: 'Afternoon snack', labelRo: 'Gustare după-amiază' },
  { slot: 5, key: 'dinner', labelEn: 'Dinner', labelRo: 'Cină' },
  { slot: 6, key: 'evening-snack', labelEn: 'Evening snack', labelRo: 'Gustare seară' },
] as const;

export type FoodMealSlot = (typeof FOOD_MEAL_SLOTS)[number]['slot'];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isDayComplete(photoCount: number): boolean {
  return photoCount >= FOOD_MEALS_PER_DAY;
}

/** Days from start (inclusive) through end (inclusive), as date keys. */
export function eachDateKey(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur <= end) {
    keys.push(toDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return keys;
}

export function getMealLabel(slot: number, language: 'en' | 'ro'): string {
  const meal = FOOD_MEAL_SLOTS.find((m) => m.slot === slot);
  if (!meal) return `Meal ${slot}`;
  return language === 'ro' ? meal.labelRo : meal.labelEn;
}
