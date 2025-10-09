import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { recipeId, dayKey, mealType } = await request.json();

    if (!recipeId || !dayKey || !mealType) {
      return NextResponse.json(
        { error: 'Missing required fields: recipeId, dayKey, mealType' },
        { status: 400 }
      );
    }

    // Get the recipe with its ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: true
      }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
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

    // Parse current week menu
    const weekMenu = plan.weekMenu as any || {};
    const dayMenu = weekMenu[dayKey] || {};

    // Create recipe group identifier
    const recipeGroupId = `recipe_${recipeId}_${Date.now()}`;
    
    // Format recipe ingredients as a grouped string
    const recipeIngredients = recipe.ingredients.map(ing => 
      `${ing.quantity || 1} ${ing.name}`
    ).join(', ');

    // Create the recipe group string with special formatting
    const recipeGroupString = `[RECIPE:${recipe.name}] ${recipeIngredients}`;

    // Add to existing meal or create new meal
    const currentMeal = dayMenu[mealType] || '';
    const newMeal = currentMeal 
      ? `${currentMeal}, ${recipeGroupString}`
      : recipeGroupString;

    // Update the day menu
    const updatedDayMenu = {
      ...dayMenu,
      [mealType]: newMeal
    };

    // Update the week menu
    const updatedWeekMenu = {
      ...weekMenu,
      [dayKey]: updatedDayMenu
    };

    // Update the nutrition plan
    const updatedPlan = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        weekMenu: updatedWeekMenu
      }
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      recipeGroup: {
        id: recipeGroupId,
        name: recipe.name,
        ingredients: recipe.ingredients
      }
    });

  } catch (error) {
    console.error('Error adding recipe to nutrition plan:', error);
    return NextResponse.json(
      { error: 'Failed to add recipe to nutrition plan' },
      { status: 500 }
    );
  }
}


