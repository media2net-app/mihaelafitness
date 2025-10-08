import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Body {
  dayKey: string;
  mealType: string; // breakfast|snack|lunch|dinner (lowercase)
  ingredientString?: string; // e.g., "100g Apple"
  name?: string; // e.g., "Apple"
}

function normalizeParts(meal: string): string[] {
  if (!meal || typeof meal !== 'string') return [];
  const cleaned = meal.replace(/\s*\+\s*/g, ',');
  return cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

// Remove leading quantity + unit and optional leading piece count e.g. '100g 1 Apple' -> 'Apple'
function cleanNameOnly(s: string): string {
  return s
    .replace(/^[^A-Za-z0-9(]*/, '')
    .replace(/^[\s\t]*/, '')
    // strip amount + unit like '100g', '200 ml', '2 tsp', '1 tbsp', '1 scoop', '1 slice'
    .replace(/^\s*\d+(?:\.\d+)?\s*(g|gram|grams|ml|milliliter|milliliters|tsp|tbsp|teaspoon|tablespoon|scoop|slice|piece|pieces)?\s*/i, '')
    // strip optional count before the name, like '1 Apple'
    .replace(/^\s*\d+\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeNamePart(p: string): string {
  let s = cleanNameOnly(p);
  // Drop id pipes like "cmg123|Apple" -> "Apple"
  if (s.includes('|')) s = s.split('|').pop()!.trim();
  return s.toLowerCase();
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: Body = await request.json();
    const dayKey = (body.dayKey || '').toLowerCase();
    const mealType = (body.mealType || '').toLowerCase();
    const ingredientString = (body.ingredientString || '').trim();
    const name = (body.name || '').trim();

    if (!dayKey || !mealType || (!ingredientString && !name)) {
      return NextResponse.json({ error: 'Missing dayKey, mealType and either ingredientString or name' }, { status: 400 });
    }

    const plan = await prisma.nutritionPlan.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const weekMenu: any = plan.weekMenu || {};
    const dayMenu: any = weekMenu[dayKey] || {};
    // locate meal by lowercase or Capitalized key
    const capKey = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    const mealKeyInUse = Object.prototype.hasOwnProperty.call(dayMenu, mealType)
      ? mealType
      : (Object.prototype.hasOwnProperty.call(dayMenu, capKey) ? capKey : mealType);
    const mealData: any = dayMenu[mealKeyInUse];
    const isObjectMeal = mealData && typeof mealData === 'object' && ('ingredients' in mealData);
    const originalMeal: string = typeof mealData === 'string' ? mealData : (isObjectMeal ? (mealData.ingredients || '') : '');
    if (!originalMeal && !isObjectMeal && typeof mealData === 'undefined') {
      // Meal slot not found; return success false to avoid 500s
      return NextResponse.json({ success: false, message: 'Meal slot not found', meal: '', plan }, { status: 200 });
    }

    const parts = normalizeParts(originalMeal);

    // Remove by normalized name only for robustness
    const targetName = (name ? normalizeNamePart(name) : cleanNameOnly(ingredientString));
    const updatedParts = parts.filter((p) => normalizeNamePart(p) !== targetName);

    const newMeal = updatedParts.join(', ');
    if (isObjectMeal) {
      weekMenu[dayKey] = {
        ...dayMenu,
        [mealKeyInUse]: {
          ...mealData,
          ingredients: newMeal,
        }
      };
    } else {
      weekMenu[dayKey] = { ...dayMenu, [mealKeyInUse]: newMeal };
    }

    const updated = await prisma.nutritionPlan.update({
      where: { id },
      data: { weekMenu },
    });

    return NextResponse.json({ success: true, meal: newMeal, plan: updated });
  } catch (err) {
    console.error('Error removing ingredient:', err);
    return NextResponse.json({ error: 'Failed to remove ingredient' }, { status: 500 });
  }
}
