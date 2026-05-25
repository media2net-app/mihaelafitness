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

/** Local calendar date key (browser / user-facing "today"). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Calendar date key from a Prisma `@db.Date` value (always UTC). */
export function toDateKeyFromDb(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD to UTC midnight for that calendar day (DB storage/query). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Start of a local calendar day as a UTC date for DB. */
export function startOfDay(date: Date): Date {
  return parseDateKey(toDateKey(date));
}

/** Start of a calendar day stored in the database. */
export function startOfDayFromDb(date: Date): Date {
  return parseDateKey(toDateKeyFromDb(date));
}

export function isDayComplete(photoCount: number): boolean {
  return photoCount >= FOOD_MEALS_PER_DAY;
}

/** Days from start (inclusive) through end (inclusive), as date keys. */
export function eachDateKey(from: Date, to: Date): string[] {
  const keys: string[] = [];
  let cur = parseDateKey(toDateKey(from));
  const end = parseDateKey(toDateKey(to));
  while (cur.getTime() <= end.getTime()) {
    keys.push(toDateKeyFromDb(cur));
    cur = new Date(cur.getTime() + 86400000);
  }
  return keys;
}

/** Add calendar days to a date key (YYYY-MM-DD). */
export function addDaysToDateKey(key: string, days: number): string {
  const next = new Date(parseDateKey(key).getTime() + days * 86400000);
  return toDateKeyFromDb(next);
}

export function isDemoFoodTrackingClient(client: {
  name?: string | null;
  email?: string | null;
}): boolean {
  const email = client.email?.toLowerCase() ?? '';
  const name = client.name?.toLowerCase() ?? '';
  return (
    email.includes('demo@mihaelafitness.com') ||
    email.includes('demo-online@') ||
    email.includes('demo-klant@') ||
    name === 'demo user' ||
    name === 'demo klant'
  );
}

export function getMealLabel(slot: number, language: 'en' | 'ro'): string {
  const meal = FOOD_MEAL_SLOTS.find((m) => m.slot === slot);
  if (!meal) return `Meal ${slot}`;
  return language === 'ro' ? meal.labelRo : meal.labelEn;
}
