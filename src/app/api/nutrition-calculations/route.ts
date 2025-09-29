import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (customerId) {
      // Get calculations for specific customer
      const nutritionCalculations = await prisma.nutritionCalculation.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(nutritionCalculations);
    } else {
      // Get all nutrition calculations
      const nutritionCalculations = await prisma.nutritionCalculation.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(nutritionCalculations);
    }
  } catch (error) {
    console.error('Error fetching nutrition calculations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition calculations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const nutritionCalculation = await prisma.nutritionCalculation.create({
      data: {
        customerId: data.customerId,
        customerName: data.customerName,
        goal: data.goal,
        currentWeight: data.currentWeight,
        targetWeight: data.targetWeight,
        height: data.height,
        age: data.age,
        activityLevel: data.activityLevel,
        gender: data.gender,
        calculatedCalories: data.calculatedCalories,
        calculatedProtein: data.calculatedProtein,
        calculatedCarbs: data.calculatedCarbs,
        calculatedFat: data.calculatedFat
      }
    });

    return NextResponse.json(nutritionCalculation, { status: 201 });
  } catch (error) {
    console.error('Error creating nutrition calculation:', error);
    return NextResponse.json(
      { error: 'Failed to create nutrition calculation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
        { status: 400 }
      );
    }

    await prisma.nutritionCalculation.delete({
      where: { id }
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error deleting nutrition calculation:', error);
    return NextResponse.json(
      { error: 'Failed to delete nutrition calculation' },
      { status: 500 }
    );
  }
}
