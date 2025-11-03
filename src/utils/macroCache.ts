// Simple in-memory cache for /api/calculate-macros results
// Keyed by a normalized ingredient string
// Reduced cache TTL for faster updates

export interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MacroApiResult {
  ingredient: string;
  nameEn?: string;
  nameRo?: string;
  amount?: number;
  unit?: string;
  pieces?: number;
  macros: MacroValues;
  error?: string | null;
}

// Removed cache for faster updates - fetch fresh data each time
async function callCalculateMacros(ingredients: string[]): Promise<MacroApiResult[]> {
  if (!ingredients || ingredients.length === 0) return [];
  const res = await fetch('/api/calculate-macros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients })
  });
  if (!res.ok) throw new Error(`calculate-macros failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results as MacroApiResult[] : [];
}

export async function getMacrosWithCache(ingredients: string[]): Promise<MacroApiResult[]> {
  // Direct API call without cache for faster updates
  return await callCalculateMacros(ingredients);
}
