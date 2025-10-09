import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, nameRo, calories, protein, carbs, fat, fiber, sugar, category, per, aliases, isActive } = body;

    // Check if ingredient exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    // Update ingredient
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameRo !== undefined && { nameRo }),
        ...(calories !== undefined && { calories: parseFloat(calories) }),
        ...(protein !== undefined && { protein: parseFloat(protein) }),
        ...(carbs !== undefined && { carbs: parseFloat(carbs) }),
        ...(fat !== undefined && { fat: parseFloat(fat) }),
        ...(fiber !== undefined && { fiber: parseFloat(fiber) }),
        ...(sugar !== undefined && { sugar: parseFloat(sugar) }),
        ...(category !== undefined && { category }),
        ...(per !== undefined && { per }),
        ...(aliases !== undefined && { aliases }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(updatedIngredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if ingredient exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    // Delete ingredient
    await prisma.ingredient.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to delete ingredient' },
      { status: 500 }
    );
  }
}
