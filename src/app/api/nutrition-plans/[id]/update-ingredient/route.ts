import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Body {
  dayKey: string;
  mealType: string; // breakfast|snack|lunch|dinner (lowercase)
  name: string; // ingredient display name
  newAmount: number; // numeric amount
  unit: string; // g|ml|tsp|tbsp|scoop|piece|pieces|slice
}

function splitMeal(meal: string): string[] {
  if (!meal || typeof meal !== 'string') return [];
  // unify delimiters
  const cleaned = meal.replace(/\s*\+\s*/g, ',');
  return cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

function normalizeNamePart(part: string): string {
  // Remove ID prefix if present (format: "id|name")
  let cleanPart = part;
  if (cleanPart.includes('|')) {
    cleanPart = cleanPart.split('|').slice(1).join('|').trim();
  }
  
  return cleanPart
    .replace(/^\s*\d+(?:\.\d+)?\s*(?:g|ml|tsp|tbsp|scoop|piece|pieces|slice)?\s*/i, '')
    .trim()
    .toLowerCase();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Body = await request.json();
    const dayKey = (body.dayKey || '').toLowerCase();
    const mealType = (body.mealType || '').toLowerCase();
    const name = (body.name || '').trim();
    const newAmount = Number(body.newAmount);
    const unit = (body.unit || 'g').trim();

    if (!dayKey || !mealType || !name || !Number.isFinite(newAmount) || newAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const plan = await prisma.nutritionPlan.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const weekMenu: any = plan.weekMenu || {};
    const dayMenu: any = weekMenu[dayKey] || {};
    const mealData: any = dayMenu[mealType];
    const isObjectMeal = mealData && typeof mealData === 'object' && ('ingredients' in mealData);
    const meal: string = typeof mealData === 'string' ? mealData : (isObjectMeal ? (mealData.ingredients || '') : '');

    const parts = splitMeal(meal);
    const targetLower = name.toLowerCase();

    let changed = false;
    const updatedParts = parts.map((p) => {
      const pName = normalizeNamePart(p);
      if (pName === targetLower) {
        changed = true;
        
        // Check if the original part has an ID format
        if (p.includes('|')) {
          // Extract ID and reconstruct with new amount
          const parts = p.split('|');
          const idPart = parts[0];
          const namePart = parts.slice(1).join('|');
          
          // Parse the ID part to extract quantity and ID
          const idMatch = idPart.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
          if (idMatch) {
            const ingredientId = idMatch[2];
            return `${newAmount} ${ingredientId}|${namePart}`.trim();
          } else {
            // Fallback: treat as simple ID
            return `${newAmount} ${idPart}|${namePart}`.trim();
          }
        } else {
          // For count-based items (piece/pieces), do not glue unit to the number
          if (unit.toLowerCase() === 'piece' || unit.toLowerCase() === 'pieces') {
            const displayName = name;
            return `${newAmount} ${displayName}`.trim();
          }
          return `${newAmount}${unit} ${name}`.trim();
        }
      }
      return p;
    });

    const newMeal = updatedParts.join(', ');
    if (!changed) {
      // If not found, return original without error to avoid breaking UI
      return NextResponse.json({ success: false, meal: meal, message: 'Ingredient not found in meal' });
    }

    // Write back depending on structure
    if (isObjectMeal) {
      weekMenu[dayKey] = {
        ...dayMenu,
        [mealType]: {
          ...mealData,
          ingredients: newMeal,
        }
      };
    } else {
      weekMenu[dayKey] = { ...dayMenu, [mealType]: newMeal };
    }

    const updated = await prisma.nutritionPlan.update({
      where: { id },
      data: { weekMenu },
    });

    return NextResponse.json({ success: true, meal: newMeal, plan: updated });
  } catch (e) {
    console.error('Error updating ingredient amount:', e);
    return NextResponse.json({ error: 'Failed to update ingredient amount' }, { status: 500 });
  }
}
