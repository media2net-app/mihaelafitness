/**
 * Balance a nutrition plan so every day has 4 green bars (kcal, P, C, F within ±5% of target).
 * - Computes current daily totals from weekMenu ingredients (formaat "qty id|name").
 * - Bepaalt wat er tekort komt of over is per macro.
 * - Schaalt bestaande porties (één factor per dag) zodat totalen richting doel gaan.
 *
 * Groen = 95–105% van doel. Als de verhouding P/C/F van een dag sterk afwijkt van
 * het doel, kan één factor niet alle vier groen maken; dan handmatig ingrediënten
 * aanpassen of meerdere keren het script draaien.
 *
 * Run: npx tsx scripts/balance-plan-macros.ts [planId]
 * Default planId: cmlidieu10000dymsrt7097h1
 */

import { PrismaClient } from '@prisma/client';

const DEFAULT_PLAN_ID = 'cmlidieu10000dymsrt7097h1';
const GREEN_MIN = 0.95;
const GREEN_MAX = 1.05;
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const prisma = new PrismaClient();

type Macros = { calories: number; protein: number; carbs: number; fat: number };

function getMealString(dayMenu: any, mealType: string): string {
  if (!dayMenu || typeof dayMenu !== 'object') return '';
  const meal = dayMenu[mealType];
  if (typeof meal === 'string') return meal;
  if (meal && typeof meal === 'object' && 'ingredients' in meal) return (meal as any).ingredients || '';
  return '';
}

type Part = { qty: number; unit: string; id?: string; name: string; raw: string };

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

const MAX_MULTIPLIER = 50; // voorkom runaway door rare per-waarden in DB

function getMultiplier(ingredient: any, qty: number, partUnit?: string): number {
  const per = String(ingredient?.per ?? '').toLowerCase();
  const gramM = per.match(/(\d+(?:\.\d+)?)\s*g/);
  const mlM = per.match(/(\d+(?:\.\d+)?)\s*ml/);
  const pieceM = per.match(/(\d+(?:\.\d+)?)\s*(piece|pieces|slice|stuks)/i);
  let mult: number;
  if (gramM) {
    const perG = parseFloat(gramM[1]) || 100;
    mult = qty / perG;
  } else if (mlM) {
    const perMl = parseFloat(mlM[1]) || 100;
    mult = qty / perMl;
  } else if (pieceM) {
    mult = qty / (parseFloat(pieceM[1]) || 1);
  } else {
    const numOnly = per.match(/^(\d+(?:\.\d+)?)$/);
    if (numOnly) mult = qty / (parseFloat(numOnly[1]) || 1);
    else mult = qty / 100;
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
  if (withoutLead !== part.name) ing = ingredientByName.get(normalizeName(withoutLead));
  return ing ?? null;
}

async function getDayTotals(
  dayMenu: any,
  ingredientById: Map<string, any>,
  ingredientByName: Map<string, any>
): Promise<Macros> {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  const keys = getMealKeys(dayMenu);
  for (const mealType of keys) {
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

function scaleFactor(current: Macros, target: Macros): number {
  // We want: factor * current in [GREEN_MIN*target, GREEN_MAX*target] for each macro.
  // So factor in [GREEN_MIN*target/current, GREEN_MAX*target/current] per macro.
  const ratios: number[] = [];
  if (target.calories > 0 && current.calories > 0) ratios.push(target.calories / current.calories);
  if (target.protein > 0 && current.protein > 0) ratios.push(target.protein / current.protein);
  if (target.carbs > 0 && current.carbs > 0) ratios.push(target.carbs / current.carbs);
  if (target.fat > 0 && current.fat > 0) ratios.push(target.fat / current.fat);
  if (ratios.length === 0) return 1;
  const lows = ratios.map((r) => r * GREEN_MIN);
  const highs = ratios.map((r) => r * GREEN_MAX);
  const factorMin = Math.max(...lows);
  const factorMax = Math.min(...highs);
  let factor: number;
  if (factorMin <= factorMax) {
    factor = (factorMin + factorMax) / 2;
  } else {
    const geo = Math.exp(ratios.reduce((s, r) => s + Math.log(r), 0) / ratios.length);
    factor = geo;
  }
  factor = Math.max(0.5, Math.min(1.4, factor));
  return factor;
}

function scaleMealString(meal: string, factor: number): string {
  const recipePrefix = meal.match(/^(\[RECIPE:[^\]]+\]\s*)/);
  const mealBody = recipePrefix ? meal.slice(recipePrefix[1].length) : meal;
  const parts = mealBody.replace(/\s*\+\s*/g, ',').split(',').map((p) => p.trim()).filter(Boolean);
  const scaled = parts.map((p) => {
    const withUnit = p.match(/^(\d+(?:\.\d+)?)\s*(g|ml)\s+(.+)$/i);
    if (withUnit) {
      const qty = Math.round(parseFloat(withUnit[1]) * factor);
      const unit = withUnit[2];
      const rest = withUnit[3];
      return `${qty}${unit} ${rest}`.trim();
    }
    const noUnit = p.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
    if (noUnit) {
      const qty = Math.round(parseFloat(noUnit[1]) * factor * 10) / 10;
      const rest = noUnit[2];
      return `${qty} ${rest}`.trim();
    }
    return p;
  });
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
    calories: plan.calories,
    protein: plan.protein,
    carbs: plan.carbs,
    fat: plan.fat,
  };
  console.log('Plan:', plan.name, '| Target:', target.calories, 'kcal', 'P:', target.protein, 'C:', target.carbs, 'F:', target.fat);

  const weekMenu = (plan.weekMenu as Record<string, any>) || {};
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

  let updated = false;
  const MAX_ITER = 12;
  for (const day of DAYS) {
    const dayMenu = weekMenu[day];
    if (!dayMenu || typeof dayMenu !== 'object') continue;

    let iter = 0;
    let current = await getDayTotals(dayMenu, ingredientById, ingredientByName);
    const hasContent = current.calories > 0 || current.protein > 0 || current.carbs > 0 || current.fat > 0;
    if (!hasContent) {
      console.log(`  ${day}: no ingredients (skip)`);
      continue;
    }

    while (iter < MAX_ITER) {
      const inGreen =
        current.calories >= target.calories * GREEN_MIN && current.calories <= target.calories * GREEN_MAX &&
        current.protein >= target.protein * GREEN_MIN && current.protein <= target.protein * GREEN_MAX &&
        current.carbs >= target.carbs * GREEN_MIN && current.carbs <= target.carbs * GREEN_MAX &&
        current.fat >= target.fat * GREEN_MIN && current.fat <= target.fat * GREEN_MAX;

      if (inGreen) {
        console.log(`  ${day}: green –`, Math.round(current.calories), 'kcal', Math.round(current.protein) + 'P', Math.round(current.carbs) + 'C', Math.round(current.fat) + 'F');
        updated = true;
        break;
      }

      const factor = scaleFactor(current, target);
      if (Math.abs(factor - 1) < 0.01) break;
      if (iter === 0) console.log(`  ${day}:`, Math.round(current.calories), 'P', Math.round(current.protein), 'C', Math.round(current.carbs), 'F', Math.round(current.fat));

      for (const mealType of getMealKeys(dayMenu)) {
        const meal = getMealString(dayMenu, mealType);
        if (!meal.trim()) continue;
        const newMeal = scaleMealString(meal, factor);
        setMealString(dayMenu, mealType, newMeal);
      }
      updated = true;
      current = await getDayTotals(dayMenu, ingredientById, ingredientByName);
      iter++;
    }
    if (iter > 0 && iter < MAX_ITER) {
      const inGreen =
        current.calories >= target.calories * GREEN_MIN && current.calories <= target.calories * GREEN_MAX &&
        current.protein >= target.protein * GREEN_MIN && current.protein <= target.protein * GREEN_MAX &&
        current.carbs >= target.carbs * GREEN_MIN && current.carbs <= target.carbs * GREEN_MAX &&
        current.fat >= target.fat * GREEN_MIN && current.fat <= target.fat * GREEN_MAX;
      if (!inGreen) console.log(`    →`, Math.round(current.calories), 'P', Math.round(current.protein), 'C', Math.round(current.carbs), 'F', Math.round(current.fat), iter, 'iters');
    }
  }

  if (updated) {
    await prisma.nutritionPlan.update({
      where: { id: planId },
      data: { weekMenu, lastUsed: new Date() },
    });
  }

  console.log('\n--- Per day (na balanceren) ---');
  for (const day of DAYS) {
    const dayMenu = weekMenu[day];
    if (!dayMenu) continue;
    const tot = await getDayTotals(dayMenu, ingredientById, ingredientByName);
    const has = tot.calories > 0 || tot.protein > 0;
    if (!has) {
      console.log(`  ${day}: geen ingrediënten`);
      continue;
    }
    const green =
      tot.calories >= target.calories * GREEN_MIN && tot.calories <= target.calories * GREEN_MAX &&
      tot.protein >= target.protein * GREEN_MIN && tot.protein <= target.protein * GREEN_MAX &&
      tot.carbs >= target.carbs * GREEN_MIN && tot.carbs <= target.carbs * GREEN_MAX &&
      tot.fat >= target.fat * GREEN_MIN && tot.fat <= target.fat * GREEN_MAX;
    console.log(`  ${day}:`, Math.round(tot.calories), 'kcal', Math.round(tot.protein) + 'P', Math.round(tot.carbs) + 'C', Math.round(tot.fat) + 'F', green ? '✓ 4x groen' : '(nog niet 4x groen – opnieuw draaien of handmatig aanpassen)');
  }
  console.log(updated ? '\nPlan bijgewerkt. Ververs de admin-pagina.' : '\nGeen aanpassingen nodig.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
