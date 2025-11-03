import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause = customerId ? { customerId, calculationType: 'v2' } : { calculationType: 'v2' };
    
    const calculations = await prisma.nutritionCalculationV2.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching V2 nutrition calculations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition calculations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Try to create the calculation
    // If model doesn't exist, the error will be caught below
    const calculation = await prisma.nutritionCalculationV2.create({
      data: {
        customerId: data.customerId,
        customerName: data.customerName,
        weight: data.weight,
        age: data.age,
        gender: data.gender,
        bodyType: data.bodyType,
        objective: data.objective,
        objectivePercentage: data.objectivePercentage,
        dailyActivity: data.dailyActivity,
        trainingHours: data.trainingHours,
        trainingIntensity: data.trainingIntensity,
        step1_mb: data.step1_mb,
        step2_gender: data.step2_gender,
        step3_age: data.step3_age,
        step4_bodyType: data.step4_bodyType,
        step5_objective: data.step5_objective,
        step6_dailyActivity: data.step6_dailyActivity,
        step7_training: data.step7_training,
        finalCalories: data.finalCalories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        calculationType: 'v2'
      }
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    console.error('Error creating V2 nutrition calculation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a model not found error
    if (errorMessage.includes('undefined') || errorMessage.includes('nutritionCalculationV2')) {
      return NextResponse.json(
        { 
          error: 'Database model not loaded. Please restart your Next.js server (stop with Ctrl+C and run: npm run dev)',
          details: errorMessage
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create nutrition calculation',
        details: errorMessage
      },
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

    const deletedCalculation = await prisma.nutritionCalculationV2.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting V2 nutrition calculation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete nutrition calculation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

