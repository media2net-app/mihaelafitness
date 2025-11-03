import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { dayKey, mealType, cookingInstructions } = await request.json();

    console.log('🍳 [API] Setting cooking instructions:', {
      planId: id,
      dayKey,
      mealType,
      instructions: cookingInstructions?.substring(0, 100) + (cookingInstructions?.length > 100 ? '...' : '')
    });

    if (!id || !dayKey || !mealType) {
      return NextResponse.json(
        { error: 'Plan ID, day key, and meal type are required' },
        { status: 400 }
      );
    }

    // Get the current nutrition plan
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      console.log('🍳 [API] Plan not found:', id);
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      );
    }

    // Get current weekMenu
    const currentWeekMenu = (plan.weekMenu as any) || {};
    const currentDayMenu = currentWeekMenu[dayKey] || {};

    console.log('🍳 [API] Current day menu structure:', {
      dayKey,
      mealType,
      hasMealData: !!currentDayMenu[mealType],
      mealDataType: typeof currentDayMenu[mealType]
    });

    // Get current meal data
    const currentMealData = currentDayMenu[mealType];

    // Create new meal data structure
    let newMealData;
    if (typeof currentMealData === 'string') {
      // Old structure: convert to new structure
      newMealData = {
        ingredients: currentMealData,
        cookingInstructions: cookingInstructions || ''
      };
      console.log('🍳 [API] Converted from old string structure');
    } else if (currentMealData && typeof currentMealData === 'object') {
      // New structure: update cooking instructions
      newMealData = {
        ...currentMealData,
        cookingInstructions: cookingInstructions || ''
      };
      console.log('🍳 [API] Updated existing object structure');
    } else {
      // No existing data: create new structure
      newMealData = {
        ingredients: '',
        cookingInstructions: cookingInstructions || ''
      };
      console.log('🍳 [API] Created new structure');
    }

    // Update the weekMenu
    const updatedWeekMenu = {
      ...currentWeekMenu,
      [dayKey]: {
        ...currentDayMenu,
        [mealType]: newMealData
      }
    };

    console.log('🍳 [API] Updated weekMenu structure:', {
      dayKey,
      mealType,
      hasIngredients: !!newMealData.ingredients,
      hasInstructions: !!newMealData.cookingInstructions,
      instructionsLength: newMealData.cookingInstructions?.length || 0
    });

    // Save to database
    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        weekMenu: updatedWeekMenu
      }
    });

    console.log('🍳 [API] Successfully saved cooking instructions');

    return NextResponse.json({
      success: true,
      plan: updatedPlan
    });

  } catch (error) {
    console.error('🍳 [API] Error updating cooking instructions:', error);
    return NextResponse.json(
      { error: 'Failed to update cooking instructions' },
      { status: 500 }
    );
  }
}
