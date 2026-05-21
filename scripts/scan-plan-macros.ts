/**
 * Scan een voedingsplan: toon target (kcal, P, C, F) en per dag de totalen + of we 4x groen halen.
 * Groen = 95–105% van target.
 * Run: npx tsx scripts/scan-plan-macros.ts [planId]
 */

import { PrismaClient } from '@prisma/client';

const PLAN_ID = process.argv[2] || 'cmlidieu10000dymsrt7097h1';
const GREEN_MIN = 0.95;
const GREEN_MAX = 1.05;
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const prisma = new PrismaClient();

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

async function getDayTotals(
  dayMenu: any,
  ingredientById: Map<string, any>,
  ingredientByName: Map<string, any>
): Promise<{ calories: number; protein: number; carbs: number; fat: number }> {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const mealType of getMealKeys(dayMenu)) {
    const meal = getMealString(dayMenu, mealType);
    for (const part of parseParts(meal)) {
      const ing = getIngredient(part, ingredientById, ingredientByName);
      if (!ing) continue;
      const mult = getMultiplier(ing, part.qty, part.unit);
      calories += (ing.calories ?? 0) * mult;
      protein += (ing.protein ?? 0) * mult;
      carbs += (ing.carbs ?? 0) * mult;
      fat += (ing.fat ?? 0) * mult;
    }
  }
  return { calories, protein, carbs, fat };
}

async function main() {
  const plan = await prisma.nutritionPlan.findUnique({ where: { id: PLAN_ID } });
  if (!plan) {
    console.error('Plan not found:', PLAN_ID);
    process.exit(1);
  }

  const target = {
    calories: plan.calories ?? 0,
    protein: plan.protein ?? 0,
    carbs: plan.carbs ?? 0,
    fat: plan.fat ?? 0,
  };

  console.log('=== TARGET (dagelijkse behoefte) ===');
  console.log('  Kcal:    ', target.calories);
  console.log('  Protein: ', target.protein + ' g');
  console.log('  Carbs:   ', target.carbs + ' g');
  console.log('  Fat:     ', target.fat + ' g');
  console.log('  (4x groen = elk tussen 95% en 105% van target)\n');

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

  console.log('=== PER DAG (huidige totalen) ===');
  for (const day of DAYS) {
    const dayMenu = weekMenu[day];
    if (!dayMenu) {
      console.log(day + ': geen data\n');
      continue;
    }
    const tot = await getDayTotals(dayMenu, ingredientById, ingredientByName);
    const inGreen = (v: number, t: number) => t > 0 && v >= t * GREEN_MIN && v <= t * GREEN_MAX;
    const kcalOk = inGreen(tot.calories, target.calories);
    const pOk = inGreen(tot.protein, target.protein);
    const cOk = inGreen(tot.carbs, target.carbs);
    const fOk = inGreen(tot.fat, target.fat);
    const greenCount = [kcalOk, pOk, cOk, fOk].filter(Boolean).length;

    const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);
    console.log(day.toUpperCase());
    console.log('  Huidig:  ', Math.round(tot.calories), 'kcal |', Math.round(tot.protein), 'P |', Math.round(tot.carbs), 'C |', Math.round(tot.fat), 'F');
    console.log('  % target:', pct(tot.calories, target.calories) + '%', '|', pct(tot.protein, target.protein) + '%', '|', pct(tot.carbs, target.carbs) + '%', '|', pct(tot.fat, target.fat) + '%');
    console.log('  Groen:   ', kcalOk ? '✓' : '✗', 'kcal  ', pOk ? '✓' : '✗', 'protein  ', cOk ? '✓' : '✗', 'carbs  ', fOk ? '✓' : '✗', 'fat  → ', greenCount === 4 ? '4x GROEN' : greenCount + '/4 groen');
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
