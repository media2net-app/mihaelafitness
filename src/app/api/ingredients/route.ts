import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    if (search) {
      // Search for specific ingredient
      const cleanTerm = search.toLowerCase().trim();
      
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          name: {
            equals: cleanTerm,
            mode: 'insensitive'
          }
        }
      });

      if (!ingredient) {
        return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
      }

      return NextResponse.json(ingredient);
    } else {
      // Return all ingredients
      const ingredients = await prisma.ingredient.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      return NextResponse.json(ingredients);
    }
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, calories, protein, carbs, fat, fiber } = body;

    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        name: {
          equals: name.toLowerCase().trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingIngredient) {
      // Update existing ingredient
      const ingredient = await prisma.ingredient.update({
        where: { id: existingIngredient.id },
        data: {
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          fiber: parseFloat(fiber) || 0
        }
      });
      return NextResponse.json(ingredient);
    } else {
      // Create new ingredient
      const ingredient = await prisma.ingredient.create({
        data: {
          name: name.toLowerCase().trim(),
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          fiber: parseFloat(fiber) || 0
        }
      });
      return NextResponse.json(ingredient);
    }
  } catch (error) {
    console.error('Error creating/updating ingredient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get('clearAll');
    
    if (clearAll === 'true') {
      // Clear all ingredients
      const result = await prisma.ingredient.deleteMany({});
      return NextResponse.json({ 
        message: `Cleared ${result.count} ingredients`,
        count: result.count 
      });
    } else {
      return NextResponse.json({ error: 'Missing clearAll parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error clearing ingredients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}