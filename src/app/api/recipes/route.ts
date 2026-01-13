import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET - Load all recipes
export async function GET(request: NextRequest) {
  try {
    // Load all recipes (both active and inactive) for now
    // If you want to filter by status, you can add: where: { status: 'active' }
    // Use select to avoid issues with columns that might not exist in the database
    // Try to load recipes with instructionsRo, fallback if column doesn't exist
    let recipes;
    try {
      recipes = await prisma.recipe.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          prepTime: true,
          servings: true,
          instructions: true,
          instructionsRo: true,
          totalCalories: true,
          totalProtein: true,
          totalCarbs: true,
          totalFat: true,
          labels: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          ingredients: {
            select: {
              id: true,
              recipeId: true,
              name: true,
              quantity: true,
              unit: true,
              exists: true,
              availableInApi: true,
              apiMatch: true,
              createdAt: true,
              updatedAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error: any) {
      // If instructionsRo column doesn't exist, try without it
      if (error?.message?.includes('instructionsRo') || error?.code === 'P2001') {
        console.warn('[API] instructionsRo column does not exist, loading without it');
        recipes = await prisma.recipe.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            prepTime: true,
            servings: true,
            instructions: true,
            totalCalories: true,
            totalProtein: true,
            totalCarbs: true,
            totalFat: true,
            labels: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            ingredients: {
              select: {
                id: true,
                recipeId: true,
                name: true,
                quantity: true,
                unit: true,
                exists: true,
                availableInApi: true,
                apiMatch: true,
                createdAt: true,
                updatedAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        // Add instructionsRo as null for all recipes
        recipes = recipes.map((recipe: any) => ({
          ...recipe,
          instructionsRo: null
        }));
      } else {
        throw error;
      }
    }

    console.log(`[API] Loaded ${recipes.length} recipes from database`);

    // Ensure labels field is included in response
    // Note: If labels are empty, the server may need to be restarted after Prisma generate
    const recipesWithLabels = recipes.map((recipe: any) => {
      // Handle labels - ensure it's always an array
      const labels = recipe.labels || [];
      const labelsArray = Array.isArray(labels) ? labels : [];
      
      // Handle mealType - check if it exists in the recipe object
      const mealType = recipe.mealType || 'other';
      
      // Ensure instructionsRo is included (may be null if column doesn't exist)
      const instructionsRo = recipe.instructionsRo || null;
      
      return {
        ...recipe,
        labels: labelsArray,
        mealType: mealType,
        instructionsRo: instructionsRo
      };
    });

    return NextResponse.json(recipesWithLabels);
  } catch (error) {
    console.error('Error loading recipes:', error);
    return NextResponse.json({ 
      error: 'Failed to load recipes', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, prepTime, servings, instructions, ingredients, labels, mealType } = body;

    // Create recipe
    const newRecipe = await prisma.recipe.create({
      data: {
        name,
        description,
        prepTime,
        servings,
        instructions: JSON.stringify(instructions || []),
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        labels: labels || [],
        mealType: mealType || 'other'
      }
    });

    // Add ingredients if provided
    if (ingredients && ingredients.length > 0) {
      await prisma.recipeIngredient.createMany({
        data: ingredients.map((ingredient: any) => ({
          recipeId: newRecipe.id,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          exists: ingredient.exists || false,
          availableInApi: ingredient.availableInApi || false,
          apiMatch: ingredient.apiMatch ? JSON.stringify(ingredient.apiMatch) : null
        }))
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe created successfully',
      recipe: newRecipe 
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json({ 
      error: 'Failed to create recipe', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}


