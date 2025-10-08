import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { dayKey, mealType, cookingInstructions } = await request.json();

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
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      );
    }

    // Get current weekMenu
    const currentWeekMenu = (plan.weekMenu as any) || {};
    const currentDayMenu = currentWeekMenu[dayKey] || {};

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
    } else if (currentMealData && typeof currentMealData === 'object') {
      // New structure: update cooking instructions
      newMealData = {
        ...currentMealData,
        cookingInstructions: cookingInstructions || ''
      };
    } else {
      // No existing data: create new structure
      newMealData = {
        ingredients: '',
        cookingInstructions: cookingInstructions || ''
      };
    }

    // Update the weekMenu
    const updatedWeekMenu = {
      ...currentWeekMenu,
      [dayKey]: {
        ...currentDayMenu,
        [mealType]: newMealData
      }
    };

    // Save to database
    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        weekMenu: updatedWeekMenu
      }
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan
    });

  } catch (error) {
    console.error('Error updating cooking instructions:', error);
    return NextResponse.json(
      { error: 'Failed to update cooking instructions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


