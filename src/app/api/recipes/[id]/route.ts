import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Load recipe by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true
      }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error loading recipe:', error);
    return NextResponse.json({ 
      error: 'Failed to load recipe', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// PUT - Update recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ingredients, totalCalories, totalProtein, totalCarbs, totalFat } = body;

    // Update recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        updatedAt: new Date()
      }
    });

    // Update ingredients
    if (ingredients) {
      // Delete existing ingredients
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: id }
      });

      // Add new ingredients
      if (ingredients.length > 0) {
        await prisma.recipeIngredient.createMany({
          data: ingredients.map((ingredient: any) => ({
            recipeId: id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            exists: ingredient.exists,
            availableInApi: ingredient.availableInApi,
            apiMatch: ingredient.apiMatch ? JSON.stringify(ingredient.apiMatch) : null
          }))
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe updated successfully',
      recipe: updatedRecipe 
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ 
      error: 'Failed to update recipe', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      prepTime, 
      servings, 
      instructions, 
      ingredients,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    } = body;

    // Create recipe
    const newRecipe = await prisma.recipe.create({
      data: {
        name,
        description,
        prepTime,
        servings,
        instructions: JSON.stringify(instructions),
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat
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
          exists: ingredient.exists,
          availableInApi: ingredient.availableInApi,
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
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
