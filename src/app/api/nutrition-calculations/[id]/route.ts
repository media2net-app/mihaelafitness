import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete nutrition calculation with id:', id);

    const deletedCalculation = await prisma.nutritionCalculation.delete({
      where: { id }
    });

    console.log('Successfully deleted nutrition calculation:', deletedCalculation.id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting nutrition calculation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete nutrition calculation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
        { status: 400 }
      );
    }

    const nutritionCalculation = await prisma.nutritionCalculation.findUnique({
      where: { id }
    });

    if (!nutritionCalculation) {
      return NextResponse.json(
        { error: 'Nutrition calculation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(nutritionCalculation);
  } catch (error) {
    console.error('Error fetching nutrition calculation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition calculation' },
      { status: 500 }
    );
  }
}
