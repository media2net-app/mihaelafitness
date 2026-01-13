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
          // Meals are stored as strings in format: "100 id|Name, 200 id|Name, ..."
          if (typeof meal === 'string' && meal.trim()) {
            console.log(`🍽️ [Translation Debug] Processing meal: ${mealKey}, content: "${meal.substring(0, 100)}..."`);
            // Split by comma to get individual ingredients
            const ingredientItems = meal.split(',');
            console.log(`  📝 [Translation Debug] Split into ${ingredientItems.length} items`);
            
            ingredientItems.forEach((item, idx) => {
              // Format: "100 id|Ingredient Name"
              // Extract the name after the pipe
              const pipeMatch = item.match(/\|(.+)$/);
              if (pipeMatch && pipeMatch[1]) {
                const ingredientName = pipeMatch[1].trim();
                ingredientNames.add(ingredientName);
                console.log(`  ✅ [Translation Debug] Item ${idx}: Extracted "${ingredientName}"`);
              } else {
                console.log(`  ❌ [Translation Debug] Item ${idx}: Failed to extract from "${item}"`);
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
    const response = NextResponse.json({
      ...nutritionPlan,
      _ingredientTranslations: translationMap
    });
    
    // Add cache control headers to prevent stale data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const body = await request.json();
    console.log('[API] PUT /api/nutrition-plans/[id] called with id:', planId);

    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      );
    }

    const allowedFields = [
      'name',
      'description',
      'goal',
      'status',
      'calories',
      'protein',
      'carbs',
      'fat',
      'meals',
      'weekMenu'
    ] as const;

    const updateData: Record<string, unknown> = {};
    allowedFields.forEach((field) => {
      if (field in body && body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id: planId },
      data: updateData
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('[API] Error updating nutrition plan:', error);
    return NextResponse.json(
      {
        error: 'Failed to update nutrition plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
