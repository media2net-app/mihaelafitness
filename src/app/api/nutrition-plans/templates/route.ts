import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to get meal string from day data
function getMealString(dayMenu: any, mealType: string): string {
  if (!dayMenu) return '';
  const meal = dayMenu[mealType];
  if (!meal) return '';
  if (typeof meal === 'string') return meal;
  if (meal && typeof meal === 'object') {
    return meal.description || meal.ingredients || '';
  }
  return '';
}

// Helper function to parse meal description
function parseMealDescription(mealDescription: string): string[] {
  if (!mealDescription || mealDescription.trim() === '') {
    return [];
  }
  
  // Handle RECIPE format: [RECIPE:Recipe Name] ingredient1, ingredient2, ...
  if (mealDescription.includes('[RECIPE:')) {
    const recipeMatch = mealDescription.match(/\[RECIPE:([^\]]+)\]\s*(.*)/);
    if (recipeMatch) {
      const recipeIngredients = recipeMatch[2];
      if (recipeIngredients) {
        return recipeIngredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
      }
    }
  }
  
  // Remove cooking instructions
  let cleaned = mealDescription
    .replace(/\. Cook.*$/i, '')
    .replace(/\. Serve.*$/i, '')
    .replace(/\. Mix.*$/i, '')
    .trim();
  
  // Handle patterns like "Pancakes: 60g oats, 2 eggs, 1 banana"
  if (cleaned.includes(':')) {
    const afterColon = cleaned.split(':')[1]?.trim();
    if (afterColon) {
      return afterColon.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
    }
  }
  
  // Handle patterns like "60g oats, 2 eggs, 1 banana"
  if (cleaned.includes(',')) {
    return cleaned.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
  }
  
  // Split on +
  const parts = cleaned.split(/\s*\+\s*/);
  return parts.map(part => part.trim()).filter(part => part.length > 0);
}

// Helper function to get ingredient data by calling the calculate-macros API
async function getIngredientDataFromAPI(mealDescription: string, request: NextRequest) {
  try {
    const ingredients = parseMealDescription(mealDescription);
    if (ingredients.length === 0) return [];

    // Call the calculate-macros API internally using the request URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    const response = await fetch(`${baseUrl}/api/calculate-macros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      console.error('Failed to calculate macros:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error getting ingredient data:', error);
    return [];
  }
}

// Calculate daily totals for a day
async function calculateDayTotals(dayData: any, request: NextRequest) {
  const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const mealType of mealOrder) {
    const meal = getMealString(dayData, mealType);
    if (!meal || meal.trim() === '') continue;

    try {
      const ingredientData = await getIngredientDataFromAPI(meal, request);
      if (ingredientData && ingredientData.length > 0) {
        const mealTotals = ingredientData.reduce((acc: any, ing: any) => ({
          calories: acc.calories + (ing.macros?.calories || 0),
          protein: acc.protein + (ing.macros?.protein || 0),
          carbs: acc.carbs + (ing.macros?.carbs || 0),
          fat: acc.fat + (ing.macros?.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        totalCalories += Math.round(mealTotals.calories);
        totalProtein += mealTotals.protein;
        totalCarbs += mealTotals.carbs;
        totalFat += mealTotals.fat;
      }
    } catch (error) {
      console.error(`Error calculating ${mealType}:`, error);
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludePlanId = searchParams.get('excludePlanId');
    
    // Get all nutrition plans with weekMenu
    const nutritionPlans = await prisma.nutritionPlan.findMany({
      select: {
        id: true,
        name: true,
        goal: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        weekMenu: true,
      },
      where: excludePlanId ? {
        id: { not: excludePlanId }
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return plans with weekMenu (calculations will be done client-side for better performance)
    const plansWithWeekMenu = nutritionPlans.map((plan) => {
      return {
        id: plan.id,
        name: plan.name,
        goal: plan.goal,
        calories: plan.calories,
        protein: plan.protein,
        carbs: plan.carbs,
        fat: plan.fat,
        weekMenu: plan.weekMenu, // Include weekMenu for client-side processing
      };
    });

    return NextResponse.json(plansWithWeekMenu);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

