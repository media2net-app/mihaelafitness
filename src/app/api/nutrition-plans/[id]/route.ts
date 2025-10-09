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
    console.log('🔍 [Translation Debug] Starting to extract ingredient names from weekMenu');
    
    if (nutritionPlan.weekMenu && typeof nutritionPlan.weekMenu === 'object') {
      const weekMenu = nutritionPlan.weekMenu as any;
      console.log('📋 [Translation Debug] WeekMenu keys:', Object.keys(weekMenu));
      
      Object.entries(weekMenu).forEach(([dayKey, day]: [string, any]) => {
        console.log(`📅 [Translation Debug] Processing day: ${dayKey}`);
        Object.entries(day || {}).forEach(([mealKey, meal]: [string, any]) => {
          if (Array.isArray(meal)) {
            console.log(`🍽️ [Translation Debug] Processing meal: ${mealKey}, items:`, meal.length);
            meal.forEach((item, idx) => {
              if (typeof item === 'string') {
                console.log(`  📝 [Translation Debug] Item ${idx}: "${item}"`);
                // Extract ingredient name from strings like "200g Banana" or "1 Egg"
                const match = item.match(/^[\d.]+\s*(?:g|kg|ml|l|piece|pieces|stuk|stuks|slice|slices|tbsp|tsp|cup|lgă|lgţ|buc|felie|felii)?\s*(.+)$/i);
                if (match && match[1]) {
                  const cleanName = match[1].trim();
                  ingredientNames.add(cleanName);
                  console.log(`  ✅ [Translation Debug] Extracted ingredient: "${cleanName}"`);
                } else {
                  console.log(`  ❌ [Translation Debug] Failed to extract ingredient from: "${item}"`);
                }
              }
            });
          }
        });
      });
    }
    
    console.log(`📊 [Translation Debug] Total unique ingredients extracted: ${ingredientNames.size}`);
    console.log('🔤 [Translation Debug] Ingredient names:', Array.from(ingredientNames));

    // Fetch all ingredient translations in one query
    console.log('🔍 [Translation Debug] Querying database for ingredients:', Array.from(ingredientNames));
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

    console.log(`📊 [Translation Debug] Found ${ingredients.length} ingredients in database`);
    ingredients.forEach(ing => {
      console.log(`  🔤 [Translation Debug] DB: "${ing.name}" -> "${ing.nameRo || 'NO TRANSLATION'}"`);
    });

    // Create a translation map
    const translationMap: { [key: string]: string } = {};
    ingredients.forEach(ing => {
      if (ing.nameRo) {
        translationMap[ing.name] = ing.nameRo;
        console.log(`  ✅ [Translation Debug] Added to map: "${ing.name}" -> "${ing.nameRo}"`);
      } else {
        console.log(`  ⚠️ [Translation Debug] Skipped (no nameRo): "${ing.name}"`);
      }
    });

    console.log('📦 [Translation Debug] Final translation map:', translationMap);
    console.log(`✨ [Translation Debug] Sending ${Object.keys(translationMap).length} translations to frontend`);

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
