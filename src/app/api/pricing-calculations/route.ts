import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    const whereClause = customerId ? { customerId } : {};

    const calculations = await prisma.pricingCalculation.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(calculations)
  } catch (error) {
    console.error('Error fetching pricing calculations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing calculations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const calculation = await prisma.pricingCalculation.create({
      data: {
        service: data.service,
        duration: data.duration,
        frequency: data.frequency,
        discount: data.discount || 0,
        vat: data.vat || 21,
        finalPrice: data.finalPrice,
        includeNutritionPlan: data.includeNutritionPlan || false,
        nutritionPlanCount: data.nutritionPlanCount || 0,
        customerId: data.customerId,
        customerName: data.customerName
      }
    })

    return NextResponse.json(calculation, { status: 201 })
  } catch (error) {
    console.error('Error creating pricing calculation:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing calculation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Pricing calculation ID is required' },
        { status: 400 }
      );
    }

    // Check if pricing calculation exists
    const existingCalculation = await prisma.pricingCalculation.findUnique({
      where: { id }
    });

    if (!existingCalculation) {
      return NextResponse.json(
        { error: 'Pricing calculation not found' },
        { status: 404 }
      );
    }

    await prisma.pricingCalculation.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Pricing calculation deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting pricing calculation:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing calculation' },
      { status: 500 }
    );
  }
}
