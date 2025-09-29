import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const planId = resolvedParams.id;

    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });

    if (!nutritionPlan) {
      return NextResponse.json({ error: 'Nutrition plan not found' }, { status: 404 });
    }

    return NextResponse.json(nutritionPlan);
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const planId = resolvedParams.id;

    // Check if nutrition plan exists
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Nutrition plan not found' }, { status: 404 });
    }

    // Delete the nutrition plan
    await prisma.nutritionPlan.delete({
      where: { id: planId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Nutrition plan deleted successfully',
      id: planId 
    });
  } catch (error) {
    console.error('Error deleting nutrition plan:', error);
    return NextResponse.json({ 
      error: 'Failed to delete nutrition plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
