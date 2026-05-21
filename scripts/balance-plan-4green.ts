/**
 * Balance a nutrition plan so every day gets 4x groen (kcal, P, C, F allemaal 95–105%).
 * Berekent per ingrediënt-occurrence een schaalfactor zodat de dagtotalen exact op target uitkomen,
 * met minimale aanpassing (minimaliseert sum (factor - 1)^2).
 *
 * Run: npx tsx scripts/balance-plan-4green.ts [planId]
 */

import { PrismaClient } from '@prisma/client';

const DEFAULT_PLAN_ID = 'cmlidieu10000dymsrt7097h1';
const GREEN_MIN = 0.95;
const GREEN_MAX = 1.05;
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const MIN_FACTOR = 0.35;
const MAX_FACTOR = 2.2;
const MAX_ITER_PER_DAY = 12;

const prisma = new PrismaClient();

type Macros = { calories: number; protein: number; carbs: number; fat: number };

type Part = { qty: number; unit: string; id?: string; name: string; raw: string };

function getMealString(dayMenu: any, mealType: string): string {
  if (!dayMenu || typeof dayMenu !== 'object') return '';
  const meal = dayMenu[mealType];
  if (typeof meal === 'string') return meal;
  if (meal && typeof meal === 'object' && 'ingredients' in meal) return (meal as any).ingredients || '';
  return '';
}

function parseParts(meal: string): Part[] {
  if (!meal || typeof meal !== 'string') return [];
  const parts = meal.replace(/\s*\+\s*/g, ',').split(',').map((p) => p.trim()).filter(Boolean);
  const result: Part[] = [];
  for (const p of parts) {
    const withUnit = p.match(/^(\d+(?:\.\d+)?)\s*(g|ml)\s+(.+)$/i);
    if (withUnit) {
      const qty = parseFloat(withUnit[1]);
      const unit = withUnit[2];
      const rest = withUnit[3].trim();
      if (rest.includes('|')) {
        const idx = rest.indexOf('|');
        const id = rest.slice(0, idx).trim();
        const name = rest.slice(idx + 1).trim();
        if (id) result.push({ qty, unit, id, name, raw: p });
      } else if (rest) {
        result.push({ qty, unit, name: rest, raw: p });
      }
      continue;
    }
    const noUnit = p.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
    if (noUnit) {
      const qty = parseFloat(noUnit[1]);
      const rest = noUnit[2].trim();
      if (rest.includes('|')) {
        const idx = rest.indexOf('|');
        const id = rest.slice(0, idx).trim();
        const name = rest.slice(idx + 1).trim();
        // "1 id|1 Slice Bread" = 1 piece, not 1 gram
        if (id) result.push({ qty, unit: 'piece', id, name, raw: p });
      } else if (rest) {
        result.push({ qty, unit: 'piece', name: rest, raw: p });
      }
    }
  }
  return result;
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

const MAX_MULTIPLIER = 50;

function getMultiplier(ingredient: any, qty: number, partUnit?: string): number {
  const per = String(ingredient?.per ?? '').toLowerCase();
  const gramM = per.match(/(\d+(?:\.\d+)?)\s*g/);
  const mlM = per.match(/(\d+(?:\.\d+)?)\s*ml/);
  const pieceM = per.match(/(\d+(?:\.\d+)?)\s*(piece|pieces|slice|stuks)/i);
  let mult: number;
  if (gramM) mult = qty / (parseFloat(gramM[1]) || 100);
  else if (mlM) mult = qty / (parseFloat(mlM[1]) || 100);
  else if (pieceM) mult = qty / (parseFloat(pieceM[1]) || 1);
  else {
    const numOnly = per.match(/^(\d+(?:\.\d+)?)$/);
    mult = numOnly ? qty / (parseFloat(numOnly[1]) || 1) : qty / 100;
  }
  return Math.min(MAX_MULTIPLIER, Math.max(0, mult));
}

function getMealKeys(dayMenu: any): string[] {
  if (!dayMenu || typeof dayMenu !== 'object') return [];
  return Object.keys(dayMenu).filter((k) => {
    if (k.endsWith('_instructions') || k === 'meta') return false;
    const v = dayMenu[k];
    return typeof v === 'string' || (typeof v === 'object' && v && 'ingredients' in v);
  });
}

function getIngredient(part: Part, ingredientById: Map<string, any>, ingredientByName: Map<string, any>): any {
  if (part.id) return ingredientById.get(part.id);
  const key = normalizeName(part.name);
  let ing = ingredientByName.get(key);
  if (ing) return ing;
  const withoutLead = part.name.replace(/^\d+(?:\.\d+)?\s+/, '').trim();
  return ingredientByName.get(normalizeName(withoutLead)) ?? null;
}

type PartContribution = { part: Part; P: number; C: number; F: number; Kcal: number };

/** Solve 4x4 linear system A*x = b with Gaussian elimination (in-place). Returns x or null if singular. */
function solve4x4(A: number[][], b: number[]): number[] | null {
  const n = 4;
  const aug = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) pivot = row;
    }
    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-10) return null;
    const div = aug[col][col];
    for (let j = 0; j <= n; j++) aug[col][j] /= div;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  return aug.map((row) => row[n]);
}

/**
 * For each part we want scale f_j such that:
 *   sum f_j * P_j = P_target, sum f_j * C_j = C_target, sum f_j * F_j = F_target, sum f_j * Kcal_j = Kcal_target
 * and minimize sum (f_j - 1)^2.
 * Lagrange gives: f_j = 1 - (λ1*P_j + λ2*C_j + λ3*F_j + λ4*Kcal_j) / 2.
 * Substituting into the 4 constraints yields 4x4 linear system in λ.
 */
function solveScaleFactors(
  contributions: PartContribution[],
  target: Macros
): number[] {
  const n = contributions.length;
  if (n === 0) return [];

  const P = contributions.map((c) => c.P);
  const C = contributions.map((c) => c.C);
  const F = contributions.map((c) => c.F);
  const K = contributions.map((c) => c.Kcal);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const sumP = sum(P);
  const sumC = sum(C);
  const sumF = sum(F);
  const sumK = sum(K);

  const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

  const A: number[][] = [
    [dot(P, P), dot(P, C), dot(P, F), dot(P, K)],
    [dot(C, P), dot(C, C), dot(C, F), dot(C, K)],
    [dot(F, P), dot(F, C), dot(F, F), dot(F, K)],
    [dot(K, P), dot(K, C), dot(K, F), dot(K, K)],
  ];
  const b = [
    2 * (sumP - target.protein),
    2 * (sumC - target.carbs),
    2 * (sumF - target.fat),
    2 * (sumK - target.calories),
  ];

  const lambda = solve4x4(A, b);
  if (!lambda) return Array(n).fill(1);

  const [λ1, λ2, λ3, λ4] = lambda;
  const factors = contributions.map((c, j) => {
    const f = 1 - (λ1 * c.P + λ2 * c.C + λ3 * c.F + λ4 * c.Kcal) / 2;
    return Math.max(MIN_FACTOR, Math.min(MAX_FACTOR, f));
  });
  return factors;
}

/** Format one part with new quantity (scaled). */
function formatPart(part: Part, scale: number): string {
  const qty = part.qty * scale;
  if (part.unit === 'g' || part.unit === 'ml') {
    const rounded = Math.round(qty);
    const safe = rounded <= 0 && qty > 0 ? 1 : rounded;
    const rest = part.id ? `${part.id}|${part.name}` : part.name;
    return `${safe}${part.unit} ${rest}`;
  }
  const rounded = Math.round(qty * 10) / 10;
  const rest = part.id ? `${part.id}|${part.name}` : part.name;
  return `${rounded} ${rest}`;
}

/** Apply per-part scale factors to a meal (mealParts in same order as factors from factorOffset). */
function scaleMealWithFactors(meal: string, mealParts: PartContribution[], factors: number[], factorOffset: number): string {
  const recipePrefix = meal.match(/^(\[RECIPE:[^\]]+\]\s*)/);
  const scaled = mealParts.map((pc, i) => formatPart(pc.part, factors[factorOffset + i] ?? 1));
  const body = scaled.join(', ');
  return recipePrefix ? recipePrefix[1] + body : body;
}

function setMealString(dayMenu: any, mealType: string, value: string): void {
  if (!dayMenu || typeof dayMenu !== 'object') return;
  const meal = dayMenu[mealType];
  if (typeof meal === 'string') {
    dayMenu[mealType] = value;
    return;
  }
  if (meal && typeof meal === 'object' && 'ingredients' in meal) {
    (meal as any).ingredients = value;
    return;
  }
  dayMenu[mealType] = value;
}

async function main() {
  const planId = process.argv[2] || DEFAULT_PLAN_ID;
  const plan = await prisma.nutritionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    console.error('Plan not found:', planId);
    process.exit(1);
  }

  const target: Macros = {
    calories: plan.calories ?? 0,
    protein: plan.protein ?? 0,
    carbs: plan.carbs ?? 0,
    fat: plan.fat ?? 0,
  };
  console.log('Plan:', plan.name);
  console.log('Target:', target.calories, 'kcal | P:', target.protein, 'C:', target.carbs, 'F:', target.fat);
  console.log('');

  const weekMenu = ((plan.weekMenu as Record<string, any>) || {});

  const allIds = new Set<string>();
  for (const day of DAYS) {
    const dayMenu = weekMenu[day];
    if (!dayMenu) continue;
    for (const mealType of getMealKeys(dayMenu)) {
      for (const part of parseParts(getMealString(dayMenu, mealType))) {
        if (part.id) allIds.add(part.id);
      }
    }
  }

  const byId = await prisma.ingredient.findMany({
    where: { id: { in: Array.from(allIds) } },
  });
  const allIng = await prisma.ingredient.findMany({
    where: { calories: { gt: 0 } },
    select: { id: true, name: true, nameRo: true, per: true, calories: true, protein: true, carbs: true, fat: true },
  });
  const ingredientById = new Map(byId.map((i) => [i.id, i]));
  const ingredientByName = new Map<string, any>();
  for (const i of allIng) {
    const n = (i.name || '').trim();
    if (n) ingredientByName.set(normalizeName(n), i);
    const r = (i.nameRo || '').trim();
    if (r) ingredientByName.set(normalizeName(r), i);
  }

  const inGreen = (v: number, t: number) => t > 0 && v >= t * GREEN_MIN && v <= t * GREEN_MAX;

  let updated = false;
  for (const day of DAYS) {
    const dayMenu = weekMenu[day];
    if (!dayMenu || typeof dayMenu !== 'object') continue;

    let iter = 0;
    let lastGreenCount = -1;

    while (iter < MAX_ITER_PER_DAY) {
      const dayParts: PartContribution[] = [];
      const mealBoundaries: { mealType: string; start: number; parts: PartContribution[] }[] = [];

      for (const mealType of getMealKeys(dayMenu)) {
        const meal = getMealString(dayMenu, mealType);
        const parts = parseParts(meal);
        const start = dayParts.length;
        for (const part of parts) {
          const ing = getIngredient(part, ingredientById, ingredientByName);
          let P = 0, C = 0, F = 0, Kcal = 0;
          if (ing) {
            const mult = getMultiplier(ing, part.qty, part.unit);
            P = (ing.protein ?? 0) * mult;
            C = (ing.carbs ?? 0) * mult;
            F = (ing.fat ?? 0) * mult;
            Kcal = (ing.calories ?? 0) * mult;
          }
          dayParts.push({ part, P, C, F, Kcal });
        }
        if (parts.length > 0) mealBoundaries.push({ mealType, start, parts: dayParts.slice(start) });
      }

      if (dayParts.length === 0) {
        console.log(day + ': geen ingrediënten, skip');
        break;
      }

      const factors = solveScaleFactors(dayParts, target);

      let newKcal = 0, newP = 0, newC = 0, newF = 0;
      dayParts.forEach((pc, j) => {
        const f = factors[j] ?? 1;
        newKcal += pc.Kcal * f;
        newP += pc.P * f;
        newC += pc.C * f;
        newF += pc.F * f;
      });

      const greenCount = [inGreen(newKcal, target.calories), inGreen(newP, target.protein), inGreen(newC, target.carbs), inGreen(newF, target.fat)].filter(Boolean).length;

      let offset = 0;
      for (const { mealType, parts: mealParts } of mealBoundaries) {
        const meal = getMealString(dayMenu, mealType);
        const newMeal = scaleMealWithFactors(meal, mealParts, factors, offset);
        setMealString(dayMenu, mealType, newMeal);
        offset += mealParts.length;
      }

      updated = true;
      if (greenCount === 4 || greenCount === lastGreenCount) break;
      lastGreenCount = greenCount;
      iter++;
    }

    const dayPartsFinal: PartContribution[] = [];
    for (const mealType of getMealKeys(dayMenu)) {
      for (const pc of parseParts(getMealString(dayMenu, mealType)).map((part) => {
        const ing = getIngredient(part, ingredientById, ingredientByName);
        let P = 0, C = 0, F = 0, Kcal = 0;
        if (ing) {
          const mult = getMultiplier(ing, part.qty, part.unit);
          P = (ing.protein ?? 0) * mult;
          C = (ing.carbs ?? 0) * mult;
          F = (ing.fat ?? 0) * mult;
          Kcal = (ing.calories ?? 0) * mult;
        }
        return { part, P, C, F, Kcal };
      })) {
        dayPartsFinal.push(pc);
      }
    }
    const tot = dayPartsFinal.reduce(
      (acc, pc) => ({
        calories: acc.calories + pc.Kcal,
        protein: acc.protein + pc.P,
        carbs: acc.carbs + pc.C,
        fat: acc.fat + pc.F,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    const greenCount = [inGreen(tot.calories, target.calories), inGreen(tot.protein, target.protein), inGreen(tot.carbs, target.carbs), inGreen(tot.fat, target.fat)].filter(Boolean).length;
    console.log(day + ':', Math.round(tot.calories), 'kcal', Math.round(tot.protein) + 'P', Math.round(tot.carbs) + 'C', Math.round(tot.fat) + 'F', greenCount === 4 ? '→ 4x groen' : '→ ' + greenCount + '/4 groen');
  }

  if (updated) {
    await prisma.nutritionPlan.update({
      where: { id: planId },
      data: { weekMenu, lastUsed: new Date() },
    });
    console.log('\nPlan opgeslagen. Ververs de admin-pagina.');
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
