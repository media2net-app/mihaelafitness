import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, calories, protein, carbs, fat, fiber, sugar, category, per } = body;

    if (!name || !calories || !protein || !carbs || !fat) {
      return NextResponse.json(
        { error: 'Missing required fields: name, calories, protein, carbs, fat' },
        { status: 400 }
      );
    }

    // Check if ingredient with this name already exists (excluding current ingredient)
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        NOT: {
          id: id
        }
      }
    });

    if (existingIngredient) {
      return NextResponse.json(
        { error: 'Ingredient with this name already exists' },
        { status: 409 }
      );
    }

    // Update ingredient
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        fiber: fiber ? parseFloat(fiber) : 0,
        sugar: sugar ? parseFloat(sugar) : 0,
        category: category || 'other',
        per: per || '100g',
        aliases: [`Pure:${name}`],
        isActive: true
      }
    });

    return NextResponse.json({ ingredient: updatedIngredient });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.ingredient.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

