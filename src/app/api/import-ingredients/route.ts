import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Ingredienten array is vereist' },
        { status: 400 }
      );
    }

    const importedIngredients = [];
    const errors = [];

    for (const ingredient of ingredients) {
      try {
        // Check if ingredient already exists
        const existingIngredient = await prisma.ingredient.findFirst({
          where: {
            name: {
              equals: ingredient.name,
              mode: 'insensitive'
            }
          }
        });

        if (existingIngredient) {
          // Update existing ingredient
          const updatedIngredient = await prisma.ingredient.update({
            where: { id: existingIngredient.id },
            data: {
              calories: ingredient.calories,
              protein: ingredient.protein,
              carbs: ingredient.carbs,
              fat: ingredient.fat,
              fiber: ingredient.fiber || 0,
              sugar: ingredient.sugar || 0,
              category: ingredient.category,
              per: '100g',
              aliases: [...(existingIngredient.aliases || []), `API:${ingredient.source}`]
            }
          });
          importedIngredients.push({ ...updatedIngredient, action: 'updated' });
        } else {
          // Create new ingredient
          const newIngredient = await prisma.ingredient.create({
            data: {
              name: ingredient.name,
              calories: ingredient.calories,
              protein: ingredient.protein,
              carbs: ingredient.carbs,
              fat: ingredient.fat,
              fiber: ingredient.fiber || 0,
              sugar: ingredient.sugar || 0,
              category: ingredient.category,
              per: '100g',
              aliases: [`API:${ingredient.source}`],
              isActive: true
            }
          });
          importedIngredients.push({ ...newIngredient, action: 'created' });
        }
      } catch (error) {
        console.error(`Error importing ingredient ${ingredient.name}:`, error);
        errors.push({
          ingredient: ingredient.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedIngredients.length,
      errors: errors.length,
      details: {
        imported: importedIngredients,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Fout bij het importeren van ingredienten' },
      { status: 500 }
    );
  }
}
