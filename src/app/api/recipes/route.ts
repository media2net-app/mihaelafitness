import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// GET - Load all recipes
export async function GET(request: NextRequest) {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(recipes);
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
    const { name, description, prepTime, servings, instructions, ingredients } = body;

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
        totalFat: 0
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


