import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the nutrition plan
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id }
    });
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    // Get all ingredients with nutritional data
    const ingredients = await prisma.ingredient.findMany({
      where: {
        calories: { gt: 0 }
      }
    });
    
    const ingredientMap = new Map();
    ingredients.forEach(ing => {
      ingredientMap.set(ing.name.toLowerCase(), ing);
    });
    
    // Function to parse ingredient from meal description
    function parseIngredient(ingredientText: string) {
      const parts = ingredientText.trim().split(/\s+/);
      
      // Extract amount and unit
      let amount = null;
      let unit = null;
      let name = ingredientText;
      
      // Check for patterns like "120g", "50g", "1 tsp", "1 tbsp", "1 scoop", "200ml"
      const amountMatch = ingredientText.match(/^(\d+(?:\.\d+)?)\s*(g|ml|tsp|tbsp|scoop|tbsp|tsp)/);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1]);
        unit = amountMatch[2];
        name = ingredientText.replace(amountMatch[0], '').trim();
      }
      
      // Clean up the name
      name = name.replace(/^\+/, '').trim();
      
      return {
        original: ingredientText,
        name: name,
        amount: amount,
        unit: unit
      };
    }
    
    // Function to calculate nutritional values based on amount and unit
    function calculateNutrition(ingredient: any, nutritionalData: any) {
      if (!nutritionalData || !ingredient.amount) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      }
      
      let multiplier = 1;
      
      // Convert to 100g equivalent
      if (ingredient.unit === 'g') {
        multiplier = ingredient.amount / 100;
      } else if (ingredient.unit === 'ml') {
        // For liquids, assume 1ml = 1g
        multiplier = ingredient.amount / 100;
      } else if (ingredient.unit === 'tsp') {
        // 1 tsp ≈ 5ml ≈ 5g
        multiplier = (ingredient.amount * 5) / 100;
      } else if (ingredient.unit === 'tbsp') {
        // 1 tbsp ≈ 15ml ≈ 15g
        multiplier = (ingredient.amount * 15) / 100;
      } else if (ingredient.unit === 'scoop') {
        // 1 scoop ≈ 30g (typical protein powder scoop)
        multiplier = (ingredient.amount * 30) / 100;
      }
      
      return {
        calories: Math.round(nutritionalData.calories * multiplier),
        protein: Math.round(nutritionalData.protein * multiplier * 10) / 10,
        carbs: Math.round(nutritionalData.carbs * multiplier * 10) / 10,
        fat: Math.round(nutritionalData.fat * multiplier * 10) / 10,
        fiber: Math.round(nutritionalData.fiber * multiplier * 10) / 10
      };
    }
    
    const weeklyAnalysis = {
      ingredients: new Map(),
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0
    };
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Process each day
    for (const day of days) {
      const dayMeals = plan.weekMenu[day];
      
      for (const [mealType, mealDescription] of Object.entries(dayMeals)) {
        // Split meal into individual ingredients
        const ingredients = mealDescription.split('+').map(ing => parseIngredient(ing.trim()));
        
        for (const ingredient of ingredients) {
          const nutritionalData = ingredientMap.get(ingredient.name.toLowerCase());
          const nutrition = calculateNutrition(ingredient, nutritionalData);
          
          if (nutritionalData) {
            // Add to weekly totals
            if (!weeklyAnalysis.ingredients.has(ingredient.name)) {
              weeklyAnalysis.ingredients.set(ingredient.name, {
                name: ingredient.name,
                totalAmount: 0,
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                totalFiber: 0,
                occurrences: 0,
                baseNutrition: {
                  calories: nutritionalData.calories,
                  protein: nutritionalData.protein,
                  carbs: nutritionalData.carbs,
                  fat: nutritionalData.fat,
                  fiber: nutritionalData.fiber
                }
              });
            }
            
            const weeklyIngredient = weeklyAnalysis.ingredients.get(ingredient.name);
            weeklyIngredient.totalAmount += ingredient.amount || 0;
            weeklyIngredient.totalCalories += nutrition.calories;
            weeklyIngredient.totalProtein += nutrition.protein;
            weeklyIngredient.totalCarbs += nutrition.carbs;
            weeklyIngredient.totalFat += nutrition.fat;
            weeklyIngredient.totalFiber += nutrition.fiber;
            weeklyIngredient.occurrences += 1;
            
            // Add to weekly totals
            weeklyAnalysis.totalCalories += nutrition.calories;
            weeklyAnalysis.totalProtein += nutrition.protein;
            weeklyAnalysis.totalCarbs += nutrition.carbs;
            weeklyAnalysis.totalFat += nutrition.fat;
            weeklyAnalysis.totalFiber += nutrition.fiber;
          }
        }
      }
    }
    
    // Convert Map to Array and sort by calories
    const ingredientsArray = Array.from(weeklyAnalysis.ingredients.values())
      .sort((a, b) => b.totalCalories - a.totalCalories);
    
    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        goal: plan.goal,
        targetCalories: plan.calories,
        targetProtein: plan.protein,
        targetCarbs: plan.carbs,
        targetFat: plan.fat
      },
      ingredients: ingredientsArray,
      totals: {
        calories: weeklyAnalysis.totalCalories,
        protein: weeklyAnalysis.totalProtein,
        carbs: weeklyAnalysis.totalCarbs,
        fat: weeklyAnalysis.totalFat,
        fiber: weeklyAnalysis.totalFiber
      },
      dailyAverage: {
        calories: Math.round(weeklyAnalysis.totalCalories / 7),
        protein: Math.round(weeklyAnalysis.totalProtein / 7 * 10) / 10,
        carbs: Math.round(weeklyAnalysis.totalCarbs / 7 * 10) / 10,
        fat: Math.round(weeklyAnalysis.totalFat / 7 * 10) / 10,
        fiber: Math.round(weeklyAnalysis.totalFiber / 7 * 10) / 10
      }
    });
    
  } catch (error) {
    console.error('Error analyzing nutrition plan ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to analyze nutrition plan ingredients' },
      { status: 500 }
    );
  }
}





