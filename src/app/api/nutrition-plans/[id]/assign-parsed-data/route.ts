import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const { parsedData } = await request.json();

    if (!parsedData || !Array.isArray(parsedData)) {
      return NextResponse.json(
        { error: 'Invalid parsed data' },
        { status: 400 }
      );
    }

    // Verify the plan exists
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 }
      );
    }

    // Process each day
    const updatedWeekMenu = { ...plan.weekMenu };
    let addedIngredients = 0;
    let skippedIngredients = 0;

    console.log('[API] Original weekMenu:', JSON.stringify(plan.weekMenu, null, 2));
    console.log('[API] Parsed data:', JSON.stringify(parsedData, null, 2));

    for (const day of parsedData) {
      const dayKey = day.dayName;
      console.log('[API] Processing day:', dayKey);
      
      if (!updatedWeekMenu[dayKey]) {
        console.log('[API] Creating new day structure for:', dayKey);
        updatedWeekMenu[dayKey] = {
          breakfast: '',
          snack: '',
          lunch: '',
          dinner: ''
        };
      }
      
      // Create instructions structure if it doesn't exist
      if (!updatedWeekMenu[`${dayKey}_instructions`]) {
        updatedWeekMenu[`${dayKey}_instructions`] = {
          breakfast: '',
          snack: '',
          lunch: '',
          dinner: ''
        };
      }

      // Process each meal for this day
      for (const meal of day.meals) {
        // Map meal names to the correct database structure
        let mealKey = meal.name;
        if (mealKey === 'morning-snack' || mealKey === 'afternoon-snack' || mealKey === 'evening-snack') {
          mealKey = 'snack';
        }
        
        console.log('[API] Processing meal:', mealKey, 'for day:', dayKey);
        console.log('[API] Available meal keys for day:', Object.keys(updatedWeekMenu[dayKey]));
        
        if (!mealKey) {
          console.log('[API] Skipping meal - no meal key:', mealKey);
          continue;
        }
        
        // Check if the meal key exists, if not, create it
        if (!updatedWeekMenu[dayKey][mealKey]) {
          console.log('[API] Creating meal key:', mealKey, 'for day:', dayKey);
          updatedWeekMenu[dayKey][mealKey] = '';
        }

        // For Text Converter, replace the entire meal content instead of adding to existing
        let mealIngredients: any[] = [];

        console.log('[API] Replacing meal content for:', mealKey, 'Ingredients count:', meal.ingredients.length);
        
        // Process all ingredients from the parsed text
        for (const ingredient of meal.ingredients) {
          if (!ingredient.matched || !ingredient.dbIngredient) {
            console.log('[API] Skipping unmatched ingredient:', ingredient.name);
            skippedIngredients++;
            continue;
          }

          // Add ingredient directly (no duplicate checking since we're replacing the entire meal)
          const newIngredient = {
            id: ingredient.dbIngredient.id,
            name: ingredient.dbIngredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            per: ingredient.dbIngredient.per,
            calories: ingredient.dbIngredient.calories,
            protein: ingredient.dbIngredient.protein,
            carbs: ingredient.dbIngredient.carbs,
            fat: ingredient.dbIngredient.fat,
            category: ingredient.dbIngredient.category
          };
          mealIngredients.push(newIngredient);
          console.log('[API] Added ingredient:', ingredient.name, 'Quantity:', ingredient.quantity, ingredient.unit);
          addedIngredients++;
        }

        // Update the meal content
        updatedWeekMenu[dayKey][mealKey] = JSON.stringify(mealIngredients);
        console.log('[API] Updated meal content for:', mealKey, 'Ingredients:', mealIngredients.length);
        
        // Store cooking instructions if they exist
        if (meal.instructions && meal.instructions.trim()) {
          console.log('[API] Storing cooking instructions for:', mealKey, 'Instructions:', meal.instructions);
          updatedWeekMenu[`${dayKey}_instructions`][mealKey] = meal.instructions;
        }
      }
    }

    console.log('[API] Final updatedWeekMenu:', JSON.stringify(updatedWeekMenu, null, 2));
    console.log('[API] Statistics - Added:', addedIngredients, 'Skipped:', skippedIngredients);

    // Update the nutrition plan in the database
    await prisma.nutritionPlan.update({
      where: { id: planId },
      data: {
        weekMenu: updatedWeekMenu,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Nutrition plan updated successfully',
      statistics: {
        addedIngredients,
        skippedIngredients,
        totalDays: parsedData.length,
        totalMeals: parsedData.reduce((sum, day) => sum + day.meals.length, 0)
      },
      plan: {
        id: planId,
        weekMenu: updatedWeekMenu
      }
    });

  } catch (error) {
    console.error('Error assigning parsed data to nutrition plan:', error);
    return NextResponse.json(
      { error: 'Failed to assign parsed data to nutrition plan' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
