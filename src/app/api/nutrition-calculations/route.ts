import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50'); // Default limit of 50

    const whereClause = customerId ? { customerId } : {};
    
    // Get nutrition calculations with limit for performance
    const nutritionCalculations = await prisma.nutritionCalculation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(nutritionCalculations);
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
    
    // Calculate BMR using Mifflin-St Jeor Equation (same as tdeecalculator.net)
    const weight = parseFloat(data.currentWeight);
    const height = parseFloat(data.height);
    const age = parseInt(data.age);
    
    let bmr;
    if (data.gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Activity multipliers (same as tdeecalculator.net)
    const activityMultipliers = {
      'sedentary': 1.2,        // Sedentary (office job)
      'light': 1.375,          // Light Exercise (1-2 days/week)
      'moderate': 1.55,        // Moderate Exercise (3-5 days/week)
      'active': 1.725,         // Heavy Exercise (6-7 days/week)
      'very-active': 1.9       // Athlete (2x per day)
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[data.activityLevel as keyof typeof activityMultipliers];
    
    const nutritionCalculation = await prisma.nutritionCalculation.create({
      data: {
        customerId: data.customerId,
        customerName: data.customerName,
        gender: data.gender,
        age: age,
        height: height,
        weight: weight,
        activityLevel: data.activityLevel,
        bmr: bmr,
        maintenanceCalories: tdee, // TDEE is the same as maintenance calories
        protein: data.calculatedProtein,
        carbs: data.calculatedCarbs,
        fat: data.calculatedFat
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
