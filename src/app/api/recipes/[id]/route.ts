import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET - Load recipe by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[API] Loading recipe with ID: ${id}`);
    
    let recipe;
    let ingredients = [];
    
    try {
      // First check if prisma is available
      if (!prisma) {
        throw new Error('Prisma client is not initialized');
      }
      
      // Try to load recipe first without ingredients
      // Use select to avoid issues with columns that might not exist in the database
      try {
        // First try with select (including instructionsRo)
        try {
          recipe = await prisma.recipe.findUnique({
            where: { id },
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
              updatedAt: true
            }
          });
        } catch (instructionsRoError: any) {
          // If instructionsRo column doesn't exist, try without it
          if (instructionsRoError?.message?.includes('instructionsRo') || instructionsRoError?.code === 'P2001') {
            console.warn('[API] instructionsRo column does not exist, loading without it');
            recipe = await prisma.recipe.findUnique({
              where: { id },
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
                updatedAt: true
              }
            });
            // Add instructionsRo as null if it doesn't exist
            if (recipe) {
              (recipe as any).instructionsRo = null;
            }
          } else {
            throw instructionsRoError;
          }
        }
        
        // If recipe exists, try to get mealType separately using raw query
        // This way we can handle if the column doesn't exist
        if (recipe) {
          try {
            const result = await prisma.$queryRaw<Array<{ mealType?: string }>>`
              SELECT "mealType" FROM recipes WHERE id = ${id}
            `;
            if (result && result.length > 0 && result[0].mealType) {
              (recipe as any).mealType = result[0].mealType;
            } else {
              (recipe as any).mealType = 'other';
            }
          } catch (mealTypeError: any) {
            // If mealType column doesn't exist in database, use default
            console.warn('[API] mealType column does not exist in database, using default "other"');
            (recipe as any).mealType = 'other';
          }
        }
      } catch (recipeError: any) {
        console.error('[API] Error loading recipe:', recipeError);
        // Check if error is about mealType column
        if (recipeError.message && recipeError.message.includes('mealType')) {
          // Try again without mealType
          try {
            recipe = await prisma.recipe.findUnique({
              where: { id },
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
                updatedAt: true
              }
            });
            if (recipe) {
              (recipe as any).mealType = 'other';
              (recipe as any).instructionsRo = null;
            }
          } catch (retryError: any) {
            throw recipeError; // Throw original error
          }
        } else {
          throw recipeError;
        }
      }
      
      // If recipe exists, load ingredients separately
      if (recipe) {
        try {
          ingredients = await prisma.recipeIngredient.findMany({
            where: { recipeId: id }
          });
          // Sort client-side if needed
          if (ingredients.length > 0 && ingredients[0].createdAt) {
            ingredients.sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              }
              return 0;
            });
          }
        } catch (ingredientError: any) {
          console.warn('[API] Error loading ingredients, continuing without them:', ingredientError);
          console.warn('[API] Ingredient error details:', {
            name: ingredientError?.name,
            code: ingredientError?.code,
            message: ingredientError?.message
          });
          // Continue without ingredients if there's an error
          ingredients = [];
        }
      }
    } catch (dbError: any) {
      console.error('[API] Database error when loading recipe:', dbError);
      console.error('[API] Error name:', dbError?.name);
      console.error('[API] Error code:', dbError?.code);
      console.error('[API] Error message:', dbError?.message);
      if (dbError?.meta) {
        console.error('[API] Error meta:', dbError.meta);
      }
      throw dbError;
    }

    if (!recipe) {
      console.log(`[API] Recipe not found with ID: ${id}`);
      // Check if any recipes exist at all
      try {
        const recipeCount = await prisma.recipe.count();
        console.log(`[API] Total recipes in database: ${recipeCount}`);
      } catch (countError) {
        console.error('[API] Error counting recipes:', countError);
      }
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    console.log(`[API] Recipe found: ${recipe.name} (${recipe.id})`);
    console.log(`[API] Loaded ${ingredients.length} ingredients`);

    // Ensure mealType is included in response
    const recipeWithMealType = {
      ...recipe,
      ingredients: ingredients,
      mealType: (recipe as any).mealType || 'other'
    };

    return NextResponse.json(recipeWithMealType);
  } catch (error) {
    console.error('[API] Error loading recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[API] Error stack:', errorStack);
    
    return NextResponse.json({ 
      error: 'Failed to load recipe', 
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
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
    const { 
      name, 
      description, 
      prepTime, 
      servings, 
      instructions,
      instructionsRo,
      ingredients, 
      totalCalories, 
      totalProtein, 
      totalCarbs, 
      totalFat,
      labels,
      mealType
    } = body;

    // Build update data object
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only include fields that are provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (servings !== undefined) updateData.servings = servings;
    if (instructions !== undefined) updateData.instructions = typeof instructions === 'string' ? instructions : JSON.stringify(instructions);
    if (instructionsRo !== undefined) updateData.instructionsRo = typeof instructionsRo === 'string' ? instructionsRo : JSON.stringify(instructionsRo);
    if (totalCalories !== undefined) updateData.totalCalories = totalCalories;
    if (totalProtein !== undefined) updateData.totalProtein = totalProtein;
    if (totalCarbs !== undefined) updateData.totalCarbs = totalCarbs;
    if (totalFat !== undefined) updateData.totalFat = totalFat;
    if (labels !== undefined) updateData.labels = labels;
    if (mealType !== undefined) updateData.mealType = mealType;

    // Update recipe
    let updatedRecipe;
    try {
      updatedRecipe = await prisma.recipe.update({
        where: { id },
        data: updateData
      });
    } catch (updateError: any) {
      console.error('[API] Error updating recipe:', updateError);
      throw new Error(`Failed to update recipe: ${updateError.message || 'Unknown error'}`);
    }

    // Update ingredients
    if (ingredients !== undefined) {
      try {
        // Delete existing ingredients
        await prisma.recipeIngredient.deleteMany({
          where: { recipeId: id }
        });

        // Add new ingredients
        if (ingredients.length > 0) {
          await prisma.recipeIngredient.createMany({
            data: ingredients.map((ingredient: any) => {
              // Validate required fields
              if (!ingredient.name || ingredient.quantity === undefined || !ingredient.unit) {
                throw new Error(`Invalid ingredient: missing required fields (name, quantity, or unit)`);
              }
              
              return {
                recipeId: id,
                name: String(ingredient.name),
                quantity: Number(ingredient.quantity),
                unit: String(ingredient.unit),
                exists: Boolean(ingredient.exists || false),
                availableInApi: Boolean(ingredient.availableInApi || false),
                apiMatch: ingredient.apiMatch 
                  ? (typeof ingredient.apiMatch === 'string' ? ingredient.apiMatch : JSON.stringify(ingredient.apiMatch))
                  : null
              };
            })
          });
        }
      } catch (ingredientError: any) {
        console.error('[API] Error updating ingredients:', ingredientError);
        throw new Error(`Failed to update ingredients: ${ingredientError.message || 'Unknown error'}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe updated successfully',
      recipe: updatedRecipe 
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', errorDetails);
    return NextResponse.json({ 
      error: 'Failed to update recipe', 
      details: errorMessage,
      message: errorMessage
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
      totalFat,
      mealType,
      labels
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
        totalFat,
        mealType: mealType || 'other',
        labels: labels || []
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

// DELETE - Delete recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete recipe (ingredients will be deleted automatically due to cascade)
    await prisma.recipe.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ 
      error: 'Failed to delete recipe', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
