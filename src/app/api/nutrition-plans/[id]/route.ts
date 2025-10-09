import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    console.log('[API] GET /api/nutrition-plans/[id] called with id:', planId);

    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });

    if (nutritionPlan) {
      console.log('[API] Plan found:', nutritionPlan.id);
    } else {
      console.warn('[API] Plan not found in DB for id:', planId);
    }

    if (!nutritionPlan) {
      return NextResponse.json({ error: 'Nutrition plan not found' }, { status: 404 });
    }

    // Get all unique ingredient names from the weekMenu
    const ingredientNames = new Set<string>();
    if (nutritionPlan.weekMenu && typeof nutritionPlan.weekMenu === 'object') {
      const weekMenu = nutritionPlan.weekMenu as any;
      Object.values(weekMenu).forEach((day: any) => {
        Object.values(day || {}).forEach((meal: any) => {
          if (Array.isArray(meal)) {
            meal.forEach(item => {
              if (typeof item === 'string') {
                // Extract ingredient name from strings like "200g Banana" or "1 Egg"
                const match = item.match(/^[\d.]+\s*(?:g|kg|ml|l|piece|pieces|stuk|stuks|slice|slices|tbsp|tsp|cup|lgă|lgţ|buc|felie|felii)?\s*(.+)$/i);
                if (match && match[1]) {
                  ingredientNames.add(match[1].trim());
                }
              }
            });
          }
        });
      });
    }

    // Fetch all ingredient translations in one query
    const ingredients = await prisma.ingredient.findMany({
      where: {
        name: {
          in: Array.from(ingredientNames)
        }
      },
      select: {
        name: true,
        nameRo: true
      }
    });

    // Create a translation map
    const translationMap: { [key: string]: string } = {};
    ingredients.forEach(ing => {
      if (ing.nameRo) {
        translationMap[ing.name] = ing.nameRo;
      }
    });

    // Return the plan with translations embedded
    return NextResponse.json({
      ...nutritionPlan,
      _ingredientTranslations: translationMap
    });
  } catch (error) {
    console.error('[API] Error fetching nutrition plan:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;
    console.log('[API] DELETE /api/nutrition-plans/[id] called with id:', planId);

    // Check if nutrition plan exists
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });

    if (!existingPlan) {
      console.warn('[API] DELETE attempted but plan not found for id:', planId);
      return NextResponse.json({ error: 'Nutrition plan not found' }, { status: 404 });
    }

    // Delete the nutrition plan
    await prisma.nutritionPlan.delete({
      where: { id: planId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Nutrition plan deleted successfully',
      id: planId 
    });
  } catch (error) {
    console.error('[API] Error deleting nutrition plan:', error);
    return NextResponse.json({ 
      error: 'Failed to delete nutrition plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
